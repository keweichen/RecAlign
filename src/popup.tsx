function saveOptions(): void {
  // Get the value of text inside textarea with id preference:
  const preference_val: string = (document.getElementById('preference') as HTMLTextAreaElement).value;
  chrome.storage.sync.set({ "preference": preference_val }).then(() => {
      console.log("Value is set to " + preference_val);
  });

  // Get value of text inside textarea with id openai-api-key:
  const openai_api_key_val: string = (document.getElementById('openai-api-key') as HTMLTextAreaElement).value;
  chrome.storage.sync.set({ "openai_api_key": openai_api_key_val }).then(() => {
      console.log("OpenAI API key saved.");
  });

  // Get the value of checkbox with id twitter, coinbase:
  const twitter_val: boolean = (document.getElementById('twitter') as HTMLInputElement).checked;
  const coinbase_val: boolean = (document.getElementById('coinbase') as HTMLInputElement).checked;
  chrome.storage.sync.set({ "twitter": twitter_val, "coinbase": coinbase_val }).then(() => {
      console.log("Twitter: " + twitter_val + ", coinbase: " + coinbase_val);
  });
}

window.addEventListener('load', function (): void {
  // Get the value of preference from storage and set it to the textarea
  chrome.storage.sync.get(["preference"]).then((result: { [key: string]: any }) => {
      console.log("Value currently is " + result.preference);
      if (result.preference == null || result.preference == "") {
          result.preference = "";
          (document.getElementById('preference') as HTMLTextAreaElement).classList.add("is-invalid");
      }
      (document.getElementById('preference') as HTMLTextAreaElement).value = result.preference;
  });

  // Get the value of openai_api_key from storage and set it to the textarea
  chrome.storage.sync.get(["openai_api_key"]).then((result: { [key: string]: any }) => {
      if (result.openai_api_key == null || result.openai_api_key == "") {
          result.openai_api_key = "";
          (document.getElementById('openai-api-key') as HTMLTextAreaElement).classList.add("is-invalid");
          (document.getElementById('openai-api-key') as HTMLTextAreaElement).value = "";
      } else {
          (document.getElementById('openai-api-key') as HTMLTextAreaElement).value = result.openai_api_key;
      }
      
  });

  // Get the value of twitter, coinbase from storage and set it to the checkbox
  chrome.storage.sync.get(["twitter", "coinbase"]).then((result: { [key: string]: any }) => {
      if (result.twitter == null) {
          result.twitter = true;
      }
      if (result.coinbase == null) {
          result.coinbase = true;
      }
      (document.getElementById('twitter') as HTMLInputElement).checked = result.twitter;
      (document.getElementById('coinbase') as HTMLInputElement).checked = result.coinbase;
  });

  document.getElementById('save-button')!.addEventListener('click', saveOptions);
});
