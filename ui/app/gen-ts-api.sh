#!/bin/sh

# generate ts API from spring restcontrollers
java -jar apina-cli.jar ../../ ./src/app/shared/ts-api.ts

# add custom types to ts-api.ts
echo "export type MultipartFile = {};" >> ./src/app/shared/ts-api.ts
