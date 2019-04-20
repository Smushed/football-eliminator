import mysql.connector
from mysql.connector import errorcode

mydb = mysql.connector.connect(
    user='root',
    password='swip867E!',
    host='localhost',
    database='employees')

mycursor = mydb.cursor()

mycursor.execute(
    "SHOW TABLES")

for thing in mycursor:
    print(thing)

mydb.close()
