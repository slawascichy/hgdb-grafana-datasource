## Mercury DB Data Source For Grafana

Projekt źródła danych dla Grafany (https://grafana.com/oss/grafana/), oprogramowania pozwalającego na 
wizualizację statystyk w postaci wykresów, budowania mechanizmów alertów, monitorowania sustemów.

### Zanim zaczniesz

Trzeba sobie przygotować środowisko developerskie. Zainstaluj sobie:
* Visual Studio Code - https://code.visualstudio.com/
* Node.js(R) - https://nodejs.org/en/download/

### Budowanie projektu

Projekt budujemy za pomocą pocecenia:
```
npm run build
```

Projekt zostanie skompilowany i umieszczony w katalogu ``dist``.
Zawartość tego katalogu należy skopiować do produktu grafany np. ``grafana-6.2.1/data/plugins/dist``.



