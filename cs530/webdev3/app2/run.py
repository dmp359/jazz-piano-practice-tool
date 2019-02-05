from flask import Flask, render_template, send_file, g, request, jsonify
import os
from db import Database


app = Flask(__name__, static_folder='public', static_url_path='')


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


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/course/<path:path>')
def base_static(path):
    return send_file(os.path.join(app.root_path, '..', '..', 'course', path))


@app.route('/api/goats')
def api_goats():
    n = request.args.get('n', default=6)
    offset = request.args.get('offset', default=0)
    goats = get_db().get_goats(n, offset)
    return jsonify(goats)


@app.route('/api/adopt')
def api_adopt():
    uid = request.args.get('uid')
    value = request.args.get('value')
    get_db().update_goat_adopted(uid, value)
    return api_goats()


@app.route('/<name>')
def generic(name):
    return render_template(name + '.html')


if __name__ == "__main__":
    app.run(host='127.0.0.1', port=8080, debug=True)
