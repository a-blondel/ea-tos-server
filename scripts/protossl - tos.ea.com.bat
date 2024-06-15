@echo off


rem Certificate Authority name
set CA_NAME=OTG3

rem Certificate name
set C_NAME=tos


rem Create private key for the Certificate Authority
openssl genrsa -aes128 -out %CA_NAME%.key.pem -passout pass:123456 1024
openssl rsa -in %CA_NAME%.key.pem -out %CA_NAME%.key.pem -passin pass:123456

rem Create the certificate of the Certificate Authority
openssl req -new -md5 -x509 -days 3600 -key %CA_NAME%.key.pem -out %CA_NAME%.crt -subj "/C=US/ST=California/L=Redwood City/O=Electronic Arts, Inc./OU=Online Technology Group/CN=OTG3 Certificate Authority"

rem ------------Certificate Authority created, now we can create Certificate------------

rem Create private key for the Certificate
openssl genrsa -aes128 -out %C_NAME%.key.pem -passout pass:123456 1024
openssl rsa -in %C_NAME%.key.pem -out %C_NAME%.key.pem -passin pass:123456

rem Create certificate signing request of the certificate
openssl req -new -key %C_NAME%.key.pem -out %C_NAME%.csr -subj "/C=US/ST=California/O=Electronic Arts, Inc./OU=Global Online Studio/CN=tos.ea.com"

rem Create the certificate
openssl x509 -req -in %C_NAME%.csr -CA %CA_NAME%.crt -CAkey %CA_NAME%.key.pem -CAcreateserial -out %C_NAME%.crt -days 3600 -md5

rem ------------Certificate created, now export it to .der format so we can modify it------------
openssl x509 -outform der -in %C_NAME%.crt -out %C_NAME%.der

echo Der file exported, now patch it manually by replacing the second instance of 2a864886f70d010104 to 2a864886f70d010101
pause

rem Convert .der to .pem
openssl x509 -inform der -in %C_NAME%.der -out %C_NAME%.cert.pem

rem Delete the files
del /Q %CA_NAME%.crt
del /Q %CA_NAME%.key.pem
del /Q %C_NAME%.crt
del /Q %C_NAME%.csr
del /Q %C_NAME%.der
del /Q %CA_NAME%.srl

echo Done!
pause