# tabulae-site
remember to upload sourcemap to Sentry after merge to production:


```
sentry-cli releases files RELEASE_VERSION upload-sourcemaps ./build/main.js.map
```
