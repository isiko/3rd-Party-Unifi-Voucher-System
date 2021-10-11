# UniFi-Backend
Dies ist ein kleines Backend für das Vouchersystem

## Voraussetzungen
Das Backend läuft auf Node.JS, was deshalb natürlich installiert sein sollte. Abgesehene davon benötigt das System Zugang
zu einer MySQL-Datenbank und natürlich dem Unifi Controller. Die Zugangsdaten sollten in der config.json Datei hinterlegt sein.
## Installation
### Repo herrunterladen
Entweder durch die Github-Website als ZIP Archiv, oder mit
````
git clone https://github.com/isiko/3rd-Party-Unifi-Voucher-System.git
````
### Dependencies installieren
Ich nutze mehrer externe Pakete, diese sind alle in der package.json Datei hinterlegt. Der Package-Manager von Node. JS
sollte also eigentlich einfach alle benötigten Pakete herunterladen können. Das geht mit folgendem Befehl.
````
npm install
````
Falls das nicht funktioniert und trotzdem noch Fehler wegen fehlender Pakete auftreten, öffnet bitte ein Issue oder sprecht mit direkt an.
### Config.json (und .env) befüllen
In der config.json sind meine aktuellen Werte drin, die könnt ihr erst mal mit benutzen, das wird erst spannend, wenn wir
das System auf die echten Daten Anpassen.
Wenn ihr sie nicht beim Starten angeben wollt, solltet ihr nun auch eine .env Datei anlegen und mit Daten befüllen

### Backend starten
Dafür einfach folgenden Befehl eingeben(wenn ihr keine .env Datei habt solltet ihr hier die Umgebungsvariablen angeben):
````
node index.js
````

###Troubleshooting
Wenn es einen Fehler mit der Datenbank giebt, kann das Setup für diese auch einfach so asugeführt werden. Der Befehl dazu lautet wie folgt:

> npm run setupDB

## How to Use
Die erste Anfrage, die eine mögliche Applikation stellen sollte, sollte an [/auth/login](#post-login) gehen.
Damit wird der Nutzer eingeloggt und die Applikation erhält ein Access und ein Refresh Token. Was es mit diesen auf sich hat, erkläre ich [hier](#auth). Weiter Access Tokens können mithilfe von [dieser Route (/auth/token)](#post-token) erstellt werden. Wenn der Nutzer dann angemeldet ist und die Applikation ein aktives Access Token hat, kann mithilfe der Route /voucher das Vouchersystem benutzt werden. Am wichtigsten ist hier die [Route /vouchers/new](#post-new), womit neue Vouchers erstellt werden können. Mit einer einfachen Anfrage an [/vouchers](#get-) können alle Voucher des aktuellen Nutzers angezeigt werden. Für weitere Informationen lese dir bitte die folgende [Sektion zu den Endpoints](#endpoints) durch. Dort sind auch noch einige Informationen zu den Möglichkeiten der Administration aufgeführt.
## Privilege
Jedem Nutzer wird in der Datenbank eine Zahl zugewiesen, die seinen Rang repräsentiert. Dieser ist beim Erstellen eines Nutzers aktuell "1",
was später einen Lehrer darstellen würde. Rang "0" hat keine besonderen Rechte, Rank "2" deutet auf einen Administrator hin.
## Endpoints
### /auth
Dieser Endpoint kümmert sich um alles, was Verifikation und Authentifizierung angeht. Hierfür verwende ich 2 JSON Webtokens,
ein "Refresh Token" und viele "Access Tokens". Die Access Tokens werden verwendet, um Aktionen durchzuführen, also um Voucher zu erstellen,
allerdings sind diese nur kurze Zeit gültig. Die Refresh Tokens sind bislang unbegrenzt gültig und werden einzig und allein
dazu verwendet, um neu Access Tokens zu generieren.
#### POST /login
Der Body sollte in etwa so aus sehen:
````json
{
    "user":{
        "name":"name",
        "password":"passwort"
    }
}
````
Als Antwort bekommt man ein Access Token und ein Refresh Token in folgendem Format:
````json
{
    "accessToken": "Access Token",
    "refreshToken": "Refresh Token"
}
````
#### POST /token
Hier könnt ihr euch mit eurem Refresh Token neue Access Tokens holen. Der Body eurer Anfrage sollte in etwa so aussehen:
````json
{
    "token": "Refresh Token"
}
````

Als Antwort bekommt ihr dann ein Access Token
````json
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Im5hbWUiOiJJc2FhayIsInBhc3N3b3JkIjoicGFzc3dvcmQifSwiaWF0IjoxNjE4MTU4MTc5LCJleHAiOjE2MTgxNTkwNzl9.KC_IP7YS-a5sAyO-V60i7EhUp3XhoKbeUOz1XSYCAjc"
}
````
#### POST /change/password
Setzt für den Nutzer ein neues Passwort. Es wird nicht überprüft, ob das passwort sich geändert hat, es wird einfach nur gehashed und in die Datenbank gespeichert
Der Body der Anfrage sollte ähnlich aussehen wie bei /login, allerdings kommt hier noch zusätzlich das feld 'password' dazu, welches das neue Passwort angibt.
````json
{
    "user":{
        "name":"root",
        "password":"root"
    },
    "password":"newPassword"
}
````
Wenn der Nutzer Adminrechte hat, können die Passwörter von allen Nutzern geändert werden. Dann sollte der Request-Body so aussehen:
````json
{
  "username":"Nutzer",
  "password":"NeuesPasswort"
}
````
Als antwort bekommt ihr nur einen 200er Code wenn alles geklappt hat, oder einen 403er Code wenn ihr nicht berechtigt seid.
#### DELETE /logout
Dieser Endpoint ist zum Ausloggen gedacht, hier könnt ihr also eurer Refresh Token löschen lassen.
Durch die Anfrage werden alle Refresh Tokens, die zu dem Nutzer des gegebenen Refresh Tokens gelöscht, das müsste allerdings vielleicht später noch angepasst werden.
Der Body eurer Anfrage sollte in etwa so aussehen:
````json
{
  "token": "Refresh Token"
}
````
Als Antwort bekommt ihr nur einen "204 No Content" Code
### /internal/vouchers
Diese Endpoints kümmern sich um das Generieren und Verwalten von Tickets. Dafür werden die Access Tokens benötigt, welche
als BEARER Token mittels eines Headers übermittelt werden
#### GET /own
Hier werden abhängig vom verwendeten Token die eigenen Tickets zurückgegeben, das sieht dann ähnlich aus wie bei GET /listall.
Benötigt Privilegs Level 0.
#### POST /
Dieser Endpoint ist dazu da, um neue Voucher für das WLAN zu generieren. Im Body der Anfrage könnt ihr die Parameter des Vouchers
angeben. Ich müsst keines der Parameter angeben, dann werden folgende Werte verwendet
Benötigt Privilegs Level 1.
````json
{
    "quota": 0,
    "count": 1,
    "duration": 45,
    "qos_usage_quota": 10000,
    "qos_rate_max_up": 1000,
    "qos_rate_max_down": 1000,
    "note": ""
}
````

Im Body der Antwort findet ihr dann einen Array mit der List der Vouchers die ihr erstellt habt. Das sieht dann in etwa so aus:
````json
[
    {
    "_id": "6073348dd3d9bc033598ec82",
    "site_id": "53e89dc9e4b017ae19604582",
    "create_time": 1618162828,
    "code": "7714879781",
    "for_hotspot": false,
    "admin_name": "UNIFI_USER",
    "quota": 0,
    "duration": 45,
    "used": 0,
    "qos_usage_quota": 10000,
    "qos_rate_max_up": 1000,
    "qos_rate_max_down": 1000,
    "qos_overwrite": true,
    "note": "",
    "status": "VALID_MULTI",
    "status_expires": 0
    },
    {
    "_id": "6073348cd3d9bc033598ec81",
    "site_id": "53e89dc9e4b017ae19604582",
    "create_time": 1618162828,
    "code": "0766859298",
    "for_hotspot": false,
    "admin_name": "UNIFI_USER",
    "quota": 0,
    "duration": 45,
    "used": 0,
    "qos_usage_quota": 10000,
    "qos_rate_max_up": 1000,
    "qos_rate_max_down": 1000,
    "qos_overwrite": true,
    "note": "",
    "status": "VALID_MULTI",
    "status_expires": 0
    }
]
````
#### GET /listAll
Gibt eine Liste aller Vouchers zurück, aktuell kann das jeder Nutzer, später sollte das möglichst nur ein Admin können.
Der Output sieht dann ähnlich aus wie der bei ``/new``, nur das hier die Liste deutlich länger sein dürfte. Benötigt Privilegs Level 2.
#### DELETE /
Löscht einen durch die VoucherID angegebenen Voucher. Der Body muss dafür die Voucher ID enthalten:
````json
{
  "id":"VOUCHERID"
}
````
Als antwort bekommt ihr einen Entsprechenden HTTP-Code
### /internal/admin
Hier sollten alle Administrativen Requests enden.
#### POST /user
Hier könnt ihr neue Nutzer registrieren. Diese Route benötigt Admin rechte, also privilege Level 2.
Der Body euerer Anfrage sollte in etwa so aussehen:
````json
{
  "username":"Nutzername",
  "password":"Passwort"
}
````
Wenn ihr mehrere Nutzer hinzufügen wollt, könnt ihr auch mehrere Nutzer Objekte in einem Array Übergeben, das sieht dann aus wie folgt:
`````json
[
  {
    "username":"Nutzer1",
    "password":"password1"
  },
  {
    "username":"Nutzer2",
    "password":"password2"
  },
  {
    "username":"Nutzer3",
    "password":"password3"
  }
]
`````
Als Antwort bekommt ihr ein JSON Element mit dem Nutzernamen und dem Passwort, allerdings ist das Passwort gehashed und
wird genau so auch in der Datenbank gespeichert. Diese Antwort sieht also in etwa so aus
````json
{
    "username":"Nutzername",
    "password":"Passwort-hash mit Salt"
}
````
#### DELETE /user
Hier könnt ihr nutzer Löschen.
Dazu muss euer Request Body alle Nutzernamen die ihr entfernen wollt in einem Array übergeben, was wie folgt aussieht:
````json
["Nutzer1", "Nutzer2", "Nutzer3", "NutzerN"]
````
Als antwort erhaltet ihr entweder einen 404 Code, wenn der Nutzer nicht gefunden werden konnte, oder einen 200 Code, wenn der Nutzer erfolgreich gelöscht wurde.
#### POST /changePrivilegs
Mit dieser Route kann das Privileg Level eines Nutzers geändert werden. Dazu mus der Body das gewünschte level und den username des Nutzers enthalten,
außerdem muss das genutzte Token zu einem Nutzer des Levels 2 gehören.
````json
{
    "privilege_level":2,
    "username": "USER"
}
````
Als antwort bekommt ihr dann nur einen Code. Im bestenfall bekommt ihr einen 200 Code, 403 bedeutet das eurer Nutzer nicht die berechtigungen hat, und 404 bedeutet das der Nutzer nicht gefunden wurde.

#### GET /users
Gibt eine Liste aller nutzer zurück. Mit hilfe von Querry Parametern könnt ihr die Suche eingrenzen. Folgende Optionen stehen zur verfühung:
- id: Die Interne ID des Nutzers
- username: Der Nutzername (hier muss der suchbegriff nur im Namen des nutzers enthalten sein)
- privilege_level: Der 'Rang' des Nutzers