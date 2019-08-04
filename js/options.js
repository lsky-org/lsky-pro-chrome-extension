let domain = document.getElementById('domain');
let account = document.getElementById('account');
let password = document.getElementById('password');

chrome.storage.sync.get({domain: "", account: "", password: ""}, (items) => {
  domain.value = items.domain;
  account.value = items.account;
  password.value = items.password;
});

document.getElementById('save').addEventListener('click', () => {
  if (domain.value.substr(0, 7).toLowerCase() !== "http://" && domain.value.substr(0, 8).toLowerCase() !== "https://") {
    domain.value = "http://" + domain.value;
  }
  chrome.storage.sync.set({
    domain: domain.value,
    account: account.value,
    password: password.value,
  }, () => {
    let status = document.getElementById('status');
    status.textContent = 'Save success.';
    setTimeout(() => {
      status.textContent = '';
    }, 750);
  });
});