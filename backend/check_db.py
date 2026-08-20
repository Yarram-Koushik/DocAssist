import sqlite3
c = sqlite3.connect('docassist.db')
print([row[0] for row in c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()])
