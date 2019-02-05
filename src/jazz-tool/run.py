# Dan Perlman, dmp359@drexel.edu
# CS530: DUI, Project

from flask import Flask, render_template, send_file
import os, json


app = Flask(__name__, static_folder='public', static_url_path='')

# # Read bike data from data.txt
# with open('data.txt') as json_file:  
#     bike_data = json.load(json_file)

# Handle the index (home) page
@app.route('/')
def index():
    return render_template('index.html')


# Handle any files that begin "/resources" by loading from the resources directory
@app.route('/resources/<path:path>')
def base_static(path):
    return send_file(os.path.join(app.root_path, '..', 'resources', path))

@app.route('/bikes')
def bikes():
    return render_template('bikes.html', data=bike_data, base_bikes_url="/img/bikes/")

# Handle any unhandled filename by loading its template.
@app.route('/<name>')
def generic(name):
    return render_template(name + '.html')


# Any additional handlers that go beyond simply loading a template
# (e.g., a handler that needs to pass data to a template) can be added here

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=8080, debug=True)
