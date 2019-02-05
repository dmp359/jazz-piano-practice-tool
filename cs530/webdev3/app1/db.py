import os
import re
import sqlite3


SQLITE_PATH = os.path.join(os.path.dirname(__file__), 'goats.db')


class Database:

    def __init__(self):
        self.conn = sqlite3.connect(SQLITE_PATH)

    def execute(self, sql, parameters=[]):
        c = self.conn.cursor()
        c.execute(sql, parameters)
        return c.fetchall()

    def get_goats(self, n, offset):
        data = self.execute(
            'SELECT * FROM goats ORDER BY uid ASC LIMIT ? OFFSET ?', [n, offset])
        return [{
            'uid': d[0],
            'name': d[1],
            'age': d[2],
            'image': d[3]
        } for d in data]

    def close(self):
        self.conn.close()
