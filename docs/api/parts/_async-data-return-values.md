## Return Values

- **`data`**: the result of the asynchronous function that is passed in.
- **`refresh`/`execute`**: a function that can be used to refresh the data returned by the handler function.
- **`error`**: an error object if the data fetching failed.
- **`status`**: a string indicating the status of the data request:
  - `idle`: when the request has not started, such as:
    - when `execute` has not yet been called and `{ immediate: false }` is set
    - when rendering HTML on the server and `{ server: false }` is set
  - `pending`: the request is in progress
  - `success`: the request has completed successfully
  - `error`: the request has failed
- **`clear`**: a function that can be used to set `data` to `undefined` (or the value of `options.default()` if provided), set `error` to `undefined`, set `status` to `idle`, and mark any currently pending requests as cancelled.

By default, Nuxt waits until a `refresh` is finished before it can be executed again.
