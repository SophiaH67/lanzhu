# Lanzhu

Lanzhu keeps track of devices publishing their own `hello/<device name>` and `death/<device name>` messages in mqtt.
She then publishes a protocol change when desired(see [protocol spec](https://gist.github.com/marnixah/7714c3d166733bec7ea90ffe1aa8ad35))
