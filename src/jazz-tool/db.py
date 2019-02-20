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

    # def get_goats(self, n, offset):
    #     data = self.select(
    #         'SELECT * FROM goats ORDER BY uid ASC LIMIT ? OFFSET ?', [n, offset])
    #     return [{
    #         'uid': d[0],
    #         'name': d[1],
    #         'age': d[2],
    #         'adopted': d[3],
    #     } for d in data]

    def get_total_goat_count(self):
        data = self.select('SELECT COUNT(*) FROM goats')
        return data[0][0]

    #//http://www.sqlitetutorial.net/tryit/query/sqlite-primary-key/#3

    def create_user(self, name, username, encrypted_password):
        self.execute('INSERT INTO users (name, username, encrypted_password) VALUES (?, ?, ?)',
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
                'encrypted_password': d[2]
            }
        else:
            return None

    def update_goat_adopted(self, uid, value):
        self.execute('UPDATE goats SET adopted=? WHERE uid=?', [value, uid])

    def close(self):
        self.conn.close()
