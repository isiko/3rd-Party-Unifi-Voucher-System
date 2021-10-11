#Frontend
Das Frontend muss nicht auf den selben Server wie das Backend laufen,
allerdings funktioniert es auch nicht ohne das Backend. Lediglich der Endnutzer muss
auf die REST-API des Backends zugreifen können.

Zum Hosten des Frontends kann jeder gängige Webserver verwendet werden, dazu muss
nur das Frontend mit folgendem Befehl einmal gebuildet werden, danach finden sich
die Entsprechenden Datein im Ordner *build*:

> npm run build

Eine weitere möglichkeit das Frontend zu Hosten stellt Docker da, hierzu habe ich ein
Dockerfile und ein Docker-Compose File angelegt, welches mit den gängigen Befehlen
genutzt werden kann

#Wichtig
Es müssen folgende Umgebungsvariablen gesetzt werden:
```dotenv
REACT_APP_BACKEND_PORT=3000 (der Port unter dem das Backend Erreichbar ist)
REACT_APP_BACKEND_URL=http://backen.url

REACT_APP_SYSTEM_NAME=Unifi Voucher System
REACT_APP_GENERAL_ERROR_MESSAGE=Irgendwas ist schiefgelaufen, sorry
REACT_APP_NOT_FOUND_ERROR_MESSAGE=Sorry, wir haben leider nix gefunden
```