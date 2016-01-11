# tunnel-server

manages tunneled connections to multiple private networks using websockets

# Build and Run

```sh
docker build -t tunnel-server .
MIN_PORT=10000
MAX_PORT=20000
docker run \
  -e "TS_MIN_PORT_RANGE=$MIN_PORT" \
  -e "TS_MAX_PORT_RANGE=$MAX_PORT" \
  -e "TS_AUTH_TOKEN=XXXXXXXXXXXXX" \
  -p=$MIN_PORT-$MAX_PORT:$MIN_PORT-$MAX_PORT \
  -p=8080:8080 \
  -p=8081:8081 \
  tunnel-server
```
