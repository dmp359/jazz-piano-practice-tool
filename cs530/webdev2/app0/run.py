from flask import Flask, render_template, send_file, request, json, g
import os


app = Flask(__name__, static_folder='public', static_url_path='')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/course/<path:path>')
def base_static(path):
    return send_file(os.path.join(app.root_path, '..', '..', 'course', path))


@app.route('/about2')
def about():
    data = {
        'related': [
            {'name': 'Rent A Goat', 'url': 'http://rentagoat.com'},
            {'name': 'We Rent Goats', 'url': 'http://werentgoats.com'},
            {'name': 'Goat Yoga', 'url': 'https://goatyoga.net/'}
        ]
    }
    return render_template('about2.html', data=data)


@app.route('/<name>')
def generic(name):
    return render_template(name + '.html')


if __name__ == "__main__":
    app.run(host='127.0.0.1', port=8080, debug=True)
