# UniFi Voucher System
> First of all, this is done by me, a student, for my School. So don't use this in any
important kind, cause there are probably a lot of security flaws and bugs in this code!

Das System kann mit den meisten UniFi Controllern interagieren.

Der Kern des Systems ist das Backend, welches mit einer RestAPI angesteuert wird, 
wodurch das Frontend austauschbar ist, was noch einfacher ist da ich für beide Componenten
Dockerfiles und Docker-Compose konfigurationen habe.

Genauere Informationen finden sie in den beiden unterordnern.

wenn sie docker-compose installiert haben, sollten sie einfach die nötigen Umgebungs-variablen
in der docker-compose.yml datei einfügen und dann beide Systeme mit folgendem Befehl starten können

> docker-compose build && docker-compose up -d
