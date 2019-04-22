import mysql.connector
from mysql.connector import errorcode

mydb = mysql.connector.connect(
    user='root',
    password='swip867E!',
    host='localhost',
    database='football')

mycursor = mydb.cursor()

mycursor.execute("CREATE TABLE players")

for thing in mycursor:
    print(thing)

mydb.close()
