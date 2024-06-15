# EA ToS

A mock of EA's ToS designed to access unreachable links for old games

## Configuration

### Certificate
In order to make the https version to work, you need a certificate.  
Thanks to the [protossl bug](https://github.com/Aim4kill/Bug_OldProtoSSL), you can create one with this file : `scripts/protossl - tos.ea.com.bat`  

Important notes :
- You will surely need to edit your `openssl.cnf` file to set `string_mask = default` (instead of utf8only) for some games to correctly read the certificate
- Some games won't be able to read certificates past 2050 (X509 certificate validity period is in `UTCTime` format until 2049, then starting from 2050 it's in `GeneralizedTime` format), but thankfully many games don't check the expiry date so you can use an expired date in UTF8STRING format and you'll be fine

### ToS mock message
Edit the `tosa.en.txt` file to match your needs.

## Running the servers

A docker-compose is here to do all the job, you can use this :
```
docker-compose up -d --build
```

You can also install node v0.10.33 and run the http or https version :
```
npm run start-http
npm run start-https
```
