# How a web page loads: from the URL to the screen

Example: typing `https://www.frostyjobs.com/jobs` (a Paradox career site of Flynn Group) in the browser.

## 1. The browser reads the URL

| Part | Value | Meaning |
| --- | --- | --- |
| scheme | `https` | encrypted connection, port 443 |
| host | `www.frostyjobs.com` | the name to turn into an IP address |
| path | `/jobs` | the page asked from the server |

## 2. DNS: from the name to an IP address

The browser needs an IP address. It looks in several caches first, then asks a resolver:

1. **Caches:** the browser's, then the operating system's (and the `hosts` file). If the answer is there and still valid, DNS stops here.
2. **Resolver:** otherwise the computer asks its resolver (the internet provider's, or `8.8.8.8`, `1.1.1.1`). The resolver does the work:

```
resolver ──► root server             "who handles .com?"            ◄── "the .com servers"
resolver ──► .com server             "who handles frostyjobs.com?"  ◄── "its name servers"
resolver ──► frostyjobs.com's server "www.frostyjobs.com?"          ◄── CNAME frostyjobs-com.sites.paradox.ai
resolver ──► paradox.ai's server     "frostyjobs-com.sites.paradox.ai?" ◄── A 34.226.237.46, 98.87.125.241…
resolver ──► computer                "34.226.237.46"
```

- **CNAME** is an alias ("this name is that other name"); **A** gives an IPv4 address.
- Each answer has a **TTL** (time to live): how long resolvers may keep it in cache.
- **This is where passive DNS records:** a sensor next to the resolver logs the CNAME and A answers it receives.

## 3. Connection to the server

1. **TCP:** the browser opens a connection to `34.226.237.46`, port 443 (a three-message handshake). Newer sites may use QUIC (HTTP/3) instead.
2. **TLS:** the browser says which site it wants (`www.frostyjobs.com`, the "SNI"), the server sends its **certificate**, and the browser checks that the name matches, that a trusted authority signed it, and that it was logged in Certificate Transparency (the logs crt.sh copies). Then both sides agree on encryption keys.

## 4. HTTP request and response

```
GET /jobs HTTP/2
Host: www.frostyjobs.com
User-Agent: Mozilla/5.0 …
Cookie: …
```

On the server side, the request usually goes through several layers before the application:

- **load balancer** (the Amazon address above), which picks a server;
- **bot protection** (here AWS WAF): it can answer **403**, or a challenge, to traffic that does not look like a browser. This is where the project's scripts get blocked;
- **application**: Paradox's career site software, which builds the HTML of page 1 with the first 10 jobs.

The response: `200 OK`, headers (content type, cache rules, cookies), then the HTML.

## 5. The browser builds the page

1. **Parse the HTML** into a tree of elements (the DOM).
2. **Load sub-resources**: CSS, JavaScript, fonts, images. Each new host needs its own DNS lookup and connection: here `cdn.sites.paradox.ai` (career site files) and `cdn.olivia.paradox.ai` (the chat widget).
3. **Apply the CSS** and run the **JavaScript**.
4. **AJAX:** when the user asks for page 2, the JavaScript sends `POST /api/get-jobs?page_number=2` and receives JSON (`jobs`, `totalJob`, `facets`). It turns that JSON into HTML elements, without reloading the page.
5. **Render:** the browser computes the layout (size and position of each element), paints the pixels, and shows the page.

## In short

```
URL ─► DNS (caches, resolver, CNAME → A) ─► TCP + TLS (certificate) ─► HTTP request
    ─► load balancer ─► bot protection ─► application ─► HTML
    ─► DOM + CSS + JavaScript ─► more requests (CDN, AJAX get-jobs) ─► page on screen
```
