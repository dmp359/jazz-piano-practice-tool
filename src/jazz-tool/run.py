# Dan Perlman, dmp359@drexel.edu
# CS530: DUI, Project

from flask import Flask, render_template, send_file, request, redirect
from werkzeug.utils import secure_filename
import boto3, botocore

ALLOWED_EXTENSIONS = set(['pdf'])
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

import os, json, sys

app = Flask(__name__, static_folder='public', static_url_path='')
app.config.from_object('config')

"""
S3 Uploading
"""
s3 = boto3.client(
   "s3",
   aws_access_key_id=app.config['S3_KEY'],
   aws_secret_access_key=app.config['S3_SECRET']
)

def upload_file_to_s3(file, bucket_name, acl="public-read"):

    """
    Docs: http://boto3.readthedocs.io/en/latest/guide/s3.html
    """

    try:
        print(bucket_name)
        s3.upload_fileobj(
            file,
            bucket_name,
            file.filename,
            ExtraArgs={
                "ACL": acl,
                "ContentType": file.content_type
            }
        )

    except Exception as e:
        print("Something Happened: ", e)
        return e

    return "{}{}".format(app.config["S3_LOCATION"], file.filename)


# Handle the index (home) page
@app.route('/')
def index():
    return render_template('index.html')


# http://flask.pocoo.org/docs/1.0/patterns/fileuploads/
@app.route("/", methods=["POST"])
def upload_file():
    print('This is error output', file=sys.stderr)

	# A
    if "user_file" not in request.files:
        print('No user_file key in request.files', file=sys.stderr)
        return "No user_file key in request.files"

	# B
    file = request.files["user_file"]
    print(file.filename, file=sys.stderr)

    """
        These attributes are also available

        file.filename               # The actual name of the file
        file.content_type
        file.content_length
        file.mimetype

    """

	# C.
    if file.filename == "":
        return "Please select a file"

	# D.
    if file and allowed_file(file.filename):
        file.filename = secure_filename(file.filename)
        
        output   	  = upload_file_to_s3(file, app.config["S3_BUCKET"])
        return redirect("/")

    else:
        return redirect("/")

# Handle any files that begin "/resources" by loading from the resources directory
@app.route('/resources/<path:path>')
def base_static(path):
    return send_file(os.path.join(app.root_path, '..', 'resources', path))

# @app.route('/bikes')
# def bikes():
#     return render_template('bikes.html', data=bike_data, base_bikes_url="/img/bikes/")

# Handle any unhandled filename by loading its template.
@app.route('/<name>')
def generic(name):
    return render_template(name + '.html')


# Any additional handlers that go beyond simply loading a template
# (e.g., a handler that needs to pass data to a template) can be added here

# Stop caching
@app.after_request
def add_header(response):
    response.cache_control.no_store = True
    return response

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=8080, debug=True)
