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
                'name': d[0][2],
                'description': d[0][3],
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
        self.execute('INSERT INTO users (name, username, encrypted_password, used_space) VALUES (?, ?, ?, 0)',
                     [name, username, encrypted_password])

    def user_exists(self, username):
        return (self.select('SELECT COUNT(*) FROM users WHERE username=?', [username])[0][0] > 0)

    def sheet_exists(self, file_name):
        return (self.select('SELECT COUNT(*) FROM sheets WHERE file_name=?', [file_name])[0][0] > 0)
 
    def get_user(self, username):
        data = self.select('SELECT * FROM users WHERE username=?', [username])
        if data:
            d = data[0]
            return {
                'name': d[0],
                'username': d[1],
                'encrypted_password': d[2],
                'used_space': d[3],
            }
        else:
            return None

    def add_sheet(self, object_url, file_name, name, description, size, username):
        self.execute('INSERT INTO sheets (object_url, file_name, name, description, size) VALUES (?, ?, ?, ?, ?)',
                     [object_url, file_name, name, description, size])
        self.execute('INSERT INTO user_sheets (username, object_url) VALUES (?, ?)',
                     [username, object_url])
    
    def get_sheet_file_name(self, object_url):
        return self.select('SELECT file_name FROM sheets WHERE object_url=?', [object_url])[0][0]

    def rename_sheet(self, object_url, newName, newDescription):
        self.execute('UPDATE sheets SET name=?, description=? WHERE object_url=?', [newName, newDescription, object_url])

    def update_user_space(self, username, space):
        self.execute('UPDATE users SET used_space=? WHERE username=?', [space, username])
    
    def remove_sheet_and_update_user(self, object_url, username):
        size = self.select('SELECT size FROM sheets WHERE object_url=?',[object_url])[0][0]
        used_space = self.get_user(username)['used_space']
        self.execute('DELETE FROM sheets WHERE object_url=?', [object_url])
        self.execute('DELETE FROM user_sheets WHERE object_url=? and username=?', [object_url, username])
        self.update_user_space(username, used_space - size) # Return the storage space

    def close(self):
        self.conn.close()
