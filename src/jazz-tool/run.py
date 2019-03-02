# Dan Perlman, dmp359@drexel.edu
# CS530: DUI, Project

from flask import Flask, render_template, send_file, g, session, request, redirect, jsonify
from werkzeug.utils import secure_filename
from passlib.hash import pbkdf2_sha256

import boto3, botocore
from db import Database
import os, json, sys

MAX_STORAGE_SPACE = 20000000 # 20 mb max per user

# Only allow pdf upload
ALLOWED_EXTENSIONS = set(['pdf'])
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

def getFileSize(filename):
    st = os.stat(filename)
    return st.st_size

app = Flask(__name__, static_folder='public', static_url_path='')
app.config.from_object('config')

# TODO: Replace with DB
urls=[]

'''
S3 Uploading
'''
s3 = boto3.client(
   's3',
   aws_access_key_id=app.config['S3_KEY'],
   aws_secret_access_key=app.config['S3_SECRET']
)

def upload_file_to_s3(file, bucket_name, acl='public-read'):

    '''
    Docs: http://boto3.readthedocs.io/en/latest/guide/s3.html
    '''

    try:
        s3.upload_fileobj(
            file,
            bucket_name,
            file.filename,
            ExtraArgs={
                'ACL': acl,
                'ContentType': file.content_type
            }
        )

    except Exception as e:
        print('Error uploading to s3 is: ', e)
        return e

    return '{}/{}'.format(app.config['S3_LOCATION'], file.filename)

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = Database()
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

# Handle the index (home) page
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['name']
        username = request.form['username']
        typed_password = request.form['password']
        if name and username and typed_password:
            if get_db().user_exists(username): # Username must be unique
                return render_template('register.html', message='Username is already taken')
            encrypted_password = pbkdf2_sha256.encrypt(typed_password, rounds=200000, salt_size=16)
            get_db().create_user(name, username, encrypted_password)
            return redirect('/login')
    return render_template('register.html')


# http://flask.pocoo.org/docs/1.0/patterns/fileuploads/
@app.route('/api/sheets', methods=['POST', 'GET'])
def upload_file():
    if 'user' not in session: # User is unauthenticated
        return redirect('/login')

    username = session['user']['username']
    if request.method == 'GET':
        sheets = get_db().get_sheets(username)
        return jsonify(sheets)

    # (Else is a post attempting to upload a file)
    if 'user_file' not in request.files:
        return 'Error - No user_file key in request.files'
 
    file = request.files['user_file']
    if file.filename == '':
        return 'Please select a file'

    # Is a pdf file
    if file and allowed_file(file.filename):

        # Check how big the file is in bytes
        file.seek(0, os.SEEK_END)
        file_length = file.tell()
        updated_storage = get_db().get_user(username)['storage_space'] + file_length
        if (updated_storage >= MAX_STORAGE_SPACE):
            return redirect('/sheets') # TODO: Send template error that file hit max
            ## TODO: Consider making a loading bar of file storage

        # File is valid to upload
        # Save a reference to the name/description in the database
        # And update the user's file size total
        file.filename = '{}/{}'.format(username, secure_filename(file.filename)) # username/filename
        url = upload_file_to_s3(file, app.config['S3_BUCKET'])
        get_db().add_sheet_url(url, request.form['name'], request.form['description'], username)
        get_db().update_user_size(username, updated_storage)
        return redirect('/sheets')
    else:
        return redirect('/sheets') # TODO: Send template error that file must be a pdf

@app.route('/api/exercises', methods=['GET'])
def get_exercises():
    if 'user' not in session: # User is unauthenticated
        return redirect('/login')

    if request.method == 'GET':
        print('get requested')
        sheets = get_db().get_exercises()
        return jsonify(sheets)

# Handle any files that begin '/resources' by loading from the resources directory
@app.route('/resources/<path:path>')
def base_static(path):
    return send_file(os.path.join(app.root_path, '..', 'resources', path))


@app.route('/login', methods=['GET', 'POST'])
def login():
    message = None
    if request.method == 'POST':
        username = request.form['username']
        typed_password = request.form['password']
        if username and typed_password:
            user = get_db().get_user(username)
            if user:
                if pbkdf2_sha256.verify(typed_password, user['encrypted_password']): # Decrypt pw
                    session['user'] = user
                    return redirect('/')
                else:
                    message = 'Incorrect password, please try again'
            else:
                message = 'Unknown user, please try again'
        elif username and not typed_password:
            message = 'Missing password, please try again'
        elif not username and typed_password:
            message = 'Missing username, please try again'
    return render_template('login.html', message=message)


@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect('/')

# Handle any unhandled filename by loading its template.
@app.route('/<name>')
def generic(name):
    # return render_template(name + '.html')
    if 'user' in session: # User is authenticated
        return render_template(name + '.html')
    else:
        return redirect('/login')


# Any additional handlers that go beyond simply loading a template
# (e.g., a handler that needs to pass data to a template) can be added here

# Stop caching
@app.after_request
def add_header(response):
    response.cache_control.no_store = True
    return response

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)
