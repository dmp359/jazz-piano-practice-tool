import os
import re
import sqlite3


SQLITE_PATH = os.path.join(os.path.dirname(__file__), 'goats.db')


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

    def get_goats(self, n, offset):
        data = self.select(
            'SELECT * FROM goats ORDER BY uid ASC LIMIT ? OFFSET ?', [n, offset])
        return [{
            'uid': d[0],
            'name': d[1],
            'age': d[2],
            'adopted': d[3],
            'image': d[4]
        } for d in data]

    def get_total_goat_count(self):
        data = self.select('SELECT COUNT(*) FROM goats')
        return data[0][0]

    def update_goat_adopted(self, uid, value):
        self.execute('UPDATE goats SET adopted=? WHERE uid=?', [value, uid])

    def close(self):
        self.conn.close()
