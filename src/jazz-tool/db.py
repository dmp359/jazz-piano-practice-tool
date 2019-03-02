import os
import re
import sqlite3


SQLITE_PATH = os.path.join(os.path.dirname(__file__), 'users.db')


class Database:

    def __init__(self):
        self.conn = sqlite3.connect(SQLITE_PATH)

    def select(self, sql, parameters=[]):
        c = self.conn.cursor()
        c.execute(sql, parameters)
        return c.fetchall()

    def execute(self, sql, parameters=[]):
        c = self.conn.cursor()
        c.execute(sql, parameters)
        self.conn.commit()

    # Schema modeled after http://www.sqlitetutorial.net/tryit/query/sqlite-primary-key/#3
    # User sheet api endpoint
    def get_sheets(self, username, n=10, offset=0):

        # Grab n urls for that user
        data = self.select('SELECT object_url FROM user_sheets WHERE username=? LIMIT ? OFFSET ?', [username, n, offset])
        if data:
            # Get the song data from that url in sheets
            sheet_data = [self.select('SELECT * FROM sheets WHERE object_url=?', [d[0]]) for d in data]
            return [{
                'object_url': d[0][0],
                'name': d[0][1],
                'description': d[0][2],
            } for d in sheet_data]
        else:
            return None

    # Exercises api endpoint
    def get_exercises(self, n=10, offset=0):

        # Grab n urls
        data = self.select('SELECT * FROM exercises LIMIT ? OFFSET ?', [n, offset])
        if data:
            return [{
                'object_url': d[0],
                'name': d[1],
            } for d in data]
        else:
            return None

    def create_user(self, name, username, encrypted_password):
        self.execute('INSERT INTO users (name, username, encrypted_password, storage_space) VALUES (?, ?, ?, 0)',
                     [name, username, encrypted_password])

    def user_exists(self, username):
        return (self.select('SELECT COUNT(*) FROM users WHERE username=?', [username])[0][0] > 0)

    def get_user(self, username):
        data = self.select('SELECT * FROM users WHERE username=?', [username])
        if data:
            d = data[0]
            return {
                'name': d[0],
                'username': d[1],
                'encrypted_password': d[2],
                'storage_space': d[3],
            }
        else:
            return None

    def add_sheet_url(self, object_url, name, description, username):
        self.execute('INSERT INTO sheets (object_url, name, description) VALUES (?, ?, ?)',
                     [object_url, name, description])
        self.execute('INSERT INTO user_sheets (username, object_url) VALUES (?, ?)',
                     [username, object_url])
        

    def update_user_size(self, username, size):
        # current_storage = self.select('SELECT storage_space FROM users WHERE username=?', [username])
        self.execute('UPDATE users SET storage_space=? WHERE username=?', [updated_storage, username])
    
    def close(self):
        self.conn.close()
