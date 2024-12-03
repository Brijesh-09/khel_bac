$ Testing API flow $
username : testuser
pass: testb1234

1-signup & signin sucessful with token .(/auth/signup) (/auth/signin)

_id 6740289bf6c05479fb8a50d2
username "testuser"
password "$2b$10$863lhdW6Pdz60BYOPYDt3OxlofO8Ho2MLwruYb6T59KrHwDcnEQ8a"
__v 0


eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NDA1ODY0ZWM4ZDczYzkwNDVhNDY3MiIsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJpYXQiOjE3MzIyNzAyMzgsImV4cCI6MTczMjI3MzgzOH0.LHTX5VDAZGNMhAAB78lJMko7ZDpfdtLxqpZfzxLV5O4

------------------------------------------------
1.1 username: testuser2
    password: test2024

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NDA1YTIzZWM4ZDczYzkwNDVhNDY3YSIsInVzZXJuYW1lIjoidGVzdHVzZXIyIiwiaWF0IjoxNzMyMjcwNjQxLCJleHAiOjE3MzIyNzQyNDF9.hw9OLySqE1vC3XZtaIVkupg_WI5pFMdKJdD7ykiZQ6g

----------------------------

2-get events created by user (/api/events) {currently we dont have events created}
: working fine

3-Get all events present (/api/getallevents) (Not protected)
: Working fine 

4-Join an event (from all the events present out by event_id/event_name) {token and event details}
:working fine
 
5-Create an Event (user id who created the event is present)
working fine : 

_id 6740297df6c05479fb8a50d9
eventname "baseball Match"
location "ISF"
count 5
time 2024-12-25T12:30:00.000+00:00
userId 6740289bf6c05479fb8a50d2

participants Array (empty)
__v 0

---------------testing with the UI-------------------------------
postman user : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NDg1MDA2MmY4ODc2ZmY3YmQwMjBkNiIsInVzZXJuYW1lIjoicG9zdG1hbnVzZXIiLCJpYXQiOjE3MzI3OTIzMzMsImV4cCI6MTczMjc5NTkzM30.kxnSdI8WPqJ0OjEZFQXNC1vkMXDluXoRuxS11Y1z-0M

----------testing profile section---------------
1:To view the events Joined by the user : working {/joinedevents}
2: To View the events created by the user  : working fine {/events}
"username": "profileuser",
    "password": "1234",
    "location" : "Mira Road" 
    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NGQ3Y2NiYTQ0NTZlZmViYjYyY2UwNCIsInVzZXJuYW1lIjoicHJvZmlsZXVzZXIiLCJsb2NhdGlvbiI6Ik1pcmEgUm9hZCIsImlhdCI6MTczMzEzMTQ5MSwiZXhwIjoxNzMzMTM1MDkxfQ.sxY60yWOFYqUAGmKaQQ-8YqHsEyyXkgKS58swoyr5OU
