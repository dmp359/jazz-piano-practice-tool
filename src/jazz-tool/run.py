# Dan Perlman, dmp359@drexel.edu
# CS530: DUI, Project

from flask import Flask, render_template, send_file, request, redirect, jsonify
from werkzeug.utils import secure_filename
import boto3, botocore

ALLOWED_EXTENSIONS = set(['pdf'])
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

import os, json, sys

app = Flask(__name__, static_folder='public', static_url_path='')
app.config.from_object('config')

# TODO: Replace with DB
urls=[]

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
        print("Error uploading to s3 is: ", e)
        return e

    return "{}/{}".format(app.config["S3_LOCATION"], file.filename)


# Handle the index (home) page
@app.route('/')
def index():
    return render_template('index.html')


# http://flask.pocoo.org/docs/1.0/patterns/fileuploads/
@app.route("/api/sheets", methods=["POST", "GET"])
def upload_file():
    if request.method == 'GET':
        return jsonify({'urls': urls})
    if "user_file" not in request.files:
        return "No user_file key in request.files"
 
    file = request.files["user_file"]
    """
        These attributes are also available
        file.filename               # The actual name of the file
        file.content_type
        file.content_length
        file.mimetype
    """

    if file.filename == "":
        return "Please select a file"

    # TODO: Pull from db
    user_name = 'john123'
    if file and allowed_file(file.filename):
        file.filename = '{}/{}'.format(user_name, secure_filename(file.filename))
        output = upload_file_to_s3(file, app.config["S3_BUCKET"])

        # TODO: Store output URL in db
        urls.append(output)
        return redirect("/sheets")
    else:
        return redirect("/sheets") # TODO: error json msg handling

# Handle any files that begin "/resources" by loading from the resources directory
@app.route('/resources/<path:path>')
def base_static(path):
    return send_file(os.path.join(app.root_path, '..', 'resources', path))

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
