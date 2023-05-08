// Set up a cache dictionary to store classification result for
// tweets that have been classified before.
const classification_cache = new Map<string, boolean>();

function checkVisible(elm: HTMLElement): boolean {
  const rect = elm.getBoundingClientRect();
  const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

function clean_twitter(): void {
  // Check whether twitter is enabled
  chrome.storage.sync.get(["twitter"]).then((result: { [key: string]: any }) => {
    if (result.twitter == null) {
      result.twitter = true;
    }
    if (result.twitter) {
      console.log("Extension running...");
      // All tweet containers:
      const containers = document.querySelectorAll("article[data-testid='tweet']");
      const tweets: string[] = [];

      const filter = Array.prototype.filter;
      const visibleContainers = filter.call(containers, (container: Element) => {
        return checkVisible(container as HTMLElement);
      });

      // Only keep tweets that have not been classified before.
      const new_tweets: string[] = [];
      const new_container: Element[] = [];
      for (let i = 0; i < visibleContainers.length; i++) {
        // Find the outermost div with data-testid="tweetText" and get the text content
        const txt_div = visibleContainers[i].querySelector("div[data-testid='tweetText']");
        if (txt_div == null) {
          console.log("[DISCOVERY] fail to find tweet text for " + visibleContainers[i].textContent.replaceAll("\n", ""));
          tweets.push("");
          continue;
        }

        const tweet = txt_div.textContent.replaceAll("\n", "");
        tweets.push(tweet);

        // Partially hide tweets that have not been classified yet.
        const parent = visibleContainers[i].closest("div[data-testid='cellInnerDiv']");
        if (!classification_cache.has(tweets[i]) && parent) {
          parent.style.opacity = "0.3";
        }

        // If tweet is new, add it to the list of tweets and add article to filtered_articles and add tweet to cache
        if (!classification_cache.has(tweet)) {
          new_tweets.push(tweet);
          new_container.push(visibleContainers[i]);
        }
      }

      // If there are no new tweets, return
      if (new_tweets.length == 0) {
        return;
      }

      chrome.storage.sync.get(["preference", "openai_api_key"]).then((result: { [key: string]: any }) => {
        console.log("Preference is " + result.preference);
        const data = {
          "messages": new_tweets,
          "preference": result.preference,
          "openai_api_key": result.openai_api_key,
        };

        // Send the data to the server and log the response to console
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://hiubwe6637gmpslsccd4ofi3de0yaeqa.lambda-url.us-east-2.on.aws/");
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(data));
        console.log("[Backend]", "Request sent...");
        xhr.onloadend = function () {
          const response = JSON.parse(xhr.responseText);
          console.log("[BACKEND]", response);
          for (let i = 0; i < response.length; i++) {
            // Set the cache to the corresponding response for the tweet
            classification_cache.set(new_tweets[i], response[i]);
          }

          for (let i = 0; i < visibleContainers.length; i++) {
            // If the cache does not contain the tweet, log the error
            if (!classification_cache.has(tweets[i])) {
              console.log("[ERROR] cache does not contain tweet " + new_tweets[i]);
              continue;
            }
            const keep = classification_cache.get(tweets[i]);
            if (!keep) {
              // Find and hide the closest parent div with data-testid="cellInnerDiv"
              visibleContainers[i].
                closest("div[data-testid='cellInnerDiv']").style.display = "none";
              console.log("[REMOVE] tweet" + visibleContainers[i].textContent.replaceAll("\n", ""));
            } else {
              // Set opacity to 1
              visibleContainers[i].closest("div[data-testid='cellInnerDiv']").style.opacity = "1";
              console.log("[KEEP] keeping tweet" + visibleContainers[i].textContent.replaceAll("\n", ""));
            }
          }
        }
      });
    }
  });
}

function clean_coinbase(): void {
  // Check whether coinbase is enabled
  chrome.storage.sync.get(["coinbase"]).then((result: any) => {
    if (result.coinbase == null) {
      result.coinbase = true;
    }
    if (result.coinbase) {
      console.log("coinbase extension running...");
      // All tweet containers:
      let containers = document.querySelectorAll("section[class^='InfiniteScroll'] > div[data-element='Box']");
      let tweets: string[] = [];

      let filter = Array.prototype.filter;
      let visibleContainers = filter.call(containers, function (container: Element) {
        return checkVisible(container as HTMLElement);
      });
      
      console.log('visibleContainers', visibleContainers);
      // Only keep tweets that have not been classified before.
      let new_tweets: string[] = [];
      let new_container: Element[] = [];
      for (let i = 0; i < visibleContainers.length; i++) {
        // Find the outermost div with data-testid="tweetText" and get the text content
        const txt_div = visibleContainers[i].querySelector("p[data-element^='Text']");
        if (txt_div == null) {
          console.log("[DISCOVERY] fail to find tweet text for " + visibleContainers[i].textContent.replaceAll("\n", ""));
          tweets.push("");
          continue;
        }

        const tweet = txt_div.textContent.replaceAll("\n", "");
        tweets.push(tweet);

        // Partially hide tweets that have not been classified yet.
        const parent = visibleContainers[i].closest("div");
        if (!classification_cache.has(tweets[i]) && parent) {
          parent.style.opacity = "0.3";
        }

        // If tweet is new, add it to the list of tweets and add article to filtered_articles and add tweet to cache
        if (!classification_cache.has(tweet)) {
          new_tweets.push(tweet);
          new_container.push(visibleContainers[i]);
        }
      }

      // If there are no new tweets, return
      if (new_tweets.length == 0) {
        return;
      }

      chrome.storage.sync.get(["preference", "openai_api_key"]).then((result: any) => {
        console.log("Value currently is " + result.preference);
        const preference = result.preference;
        const data = {
          "messages": new_tweets,
          "preference": preference,
          "openai_api_key": result.openai_api_key,
        };

        // Send the data to the server and log the response to console
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://hiubwe6637gmpslsccd4ofi3de0yaeqa.lambda-url.us-east-2.on.aws/");
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(data));
        console.log("[Backend]", "Request sent...");
        xhr.onloadend = function () {
          const response = JSON.parse(xhr.responseText);
          console.log("[BACKEND]", response);
          for (let i = 0; i < response.length; i++) {
            // Set the cache to the corresponding response for the tweet
            classification_cache.set(new_tweets[i], response[i]);
          }

          for (let i = 0; i < visibleContainers.length; i++) {
            // If the cache does not contain the tweet, log the error
            if (!classification_cache.has(tweets[i])) {
              console.log("[ERROR] cache does not contain tweet: " + tweets[i]);
              continue;
            }
            const keep = classification_cache.get(tweets[i]);
            if (!keep) {
              // Find and hide the closest parent div with data-testid="cellInnerDiv"
              visibleContainers[i].style.display = "none";
              console.log("[REMOVE] tweet: " + tweets[i]);
            } else {
              // Set opacity to 1
              visibleContainers[i].style.opacity = "1";
              console.log("[KEEP] keeping tweet: " + tweets[i]);
            }
          }
        }
      });
    }
  });
}


let inProgress = false;

// Run every 3 seconds.
setInterval(() => {
  // Prevent multiple instances from running at the same time.
  if (inProgress) {
    return;
  }
  inProgress = true;

  // If the user is on Twitter, run the Twitter extension
  if (window.location.href === "https://twitter.com/home" || window.location.href === "https://www.twitter.com/home") {
    clean_twitter();
    // If the user is on coinbase, run the coinbase extension
  } else if (window.location.href === "https://www.coinbase.com/home" || window.location.href === "https://www.coinbase.com/follow") {
    clean_coinbase();
  }
  inProgress = false;
}, 3000);






