# vnds-online

Javascript-implementation of the VNDS engine 

VNDS ports:<br>
  Ever17 (rus): https://yadi.sk/d/CG12mrRX3LDMYW<br>
  Phenomeno (rus): https://yadi.sk/d/StuCcXl-3LDMa5<br>
  Tsukihime (eng): https://yadi.sk/d/65758MMx3LDMas<br>
  Umineko no Naku Koro ni (rus): https://yadi.sk/d/q-11VMQT3LDMgL<br>
  Who is Mike (rus): https://yadi.sk/d/VPMmwSp_3VM9xq<br>
  Yume Miru Kusuri (rus): https://yadi.sk/d/cEfBuKsi3VMByv<br>

VNDS2 ports:<br>
  Essence Hunt (rus): https://yadi.sk/d/Y531BYsO3VM9fv<br>
  Air Pressure (rus): https://yadi.sk/d/38SwZN0P3YBSg3<br>
  Шепотки (rus): https://yadi.sk/d/Bk72Bogg3YBShS<br>
  Katawa Shoujo (rus, 1 act): https://yadi.sk/d/EWDcdB8r3adSdk


## Run on Windows

Just run `vnds-online.exe` - it's both web server and browser in a single executable. You don't need anything else. 

`vnds-online.exe` could ask you to install WebView2 from Microsoft on older Windows systems (Win10 and elder). It's required for the application to be able to inline system web browser.

And otherwise - you don't need to copy vnds-online.exe to your actual web server.


## Run on Windows - Alternative way

Use [CivetWeb](http://civetweb.github.io/civetweb/). You don't need to install PHP or anything to run vnds-online on Windows - copy `CivetWeb32.exe` into the root and run it. It'll start a web server for you. Now you could open http://127.0.0.1:8080/ in your browser. Or right click on CivetWeb tray icon and select "Start browser" there.


## Adding new games

Unzip your new game and put int `games` folder. Also, you'll need to unzip all zip-files inside. For example, background, foreground, sound etc could be zipped as well.
