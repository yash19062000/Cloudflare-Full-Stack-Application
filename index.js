addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})


class ElementHandler {

  element(element) {
    if (element.tagName === "a") {
      element.setAttribute("href", "https://www.google.com");
      element.setInnerContent("Checkout Google");
    }
  }


  text(text) {

    if (text.text.includes("Variant 1")) {
      text.replace("Type 1");
    }
    if (text.text.includes("Variant 2")) {
      text.replace("Type 2");
    }
    if (text.text.includes("This is variant one of the take home project!")) {
      text.replace("Version 1 of Yash Himmatramka's project");
    }
    if (text.text.includes("This is variant two of the take home project!")) {
      text.replace("Version 2 of Yash Himmatramka's project");
    }
  }
}

function getCookie(request, name) {
  let result = null
  let cookieString = request.headers.get('Cookie')
  if (cookieString) {
    let cookies = cookieString.split(';')
    cookies.forEach(cookie => {
      let cookieName = cookie.split('=')[0].trim()
      if (cookieName === name) {
        let cookieVal = cookie.split('=')[1]
        result = cookieVal
      }
    })
  }
  return result
}

async function handleRequest(request) {

  let response = await fetch("https://cfw-takehome.developers.workers.dev/api/variants");
  let site = await response.json();


  let requestUrl;
  let createCookie = false;
  let v;
  const cookie = getCookie(request, 'variant');
  if (cookie && cookie === '0') {
    requestUrl = site.variants[0];
  } else if (cookie && cookie === '1') {
    requestUrl = site.variants[1];
  } else {
    v = (Math.random() >= 0.5) ? 0 : 1;
    requestUrl = site.variants[v];
    createCookie = true;
  }


  let variantResponse = await fetch(requestUrl);

  let document = new HTMLRewriter().on('*', new ElementHandler()).transform(variantResponse)
  let output = await document.text();

  let outputRes = new Response(output, variantResponse);

  if (createCookie) {
    outputRes.headers.append('Set-Cookie', `variant=${v}`);
  }

  return outputRes;
}