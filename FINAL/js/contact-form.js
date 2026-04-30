document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('contact-form');
  var status = document.getElementById('contact-form-status');
  var shell = document.getElementById('contact-card-shell');
  var success = document.getElementById('contact-success');
  var resetButton = document.getElementById('contact-reset');
  var submitButton = form ? form.querySelector('.contact-submit') : null;

  if (!form || !status || !shell || !success || !submitButton) {
    return;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var formData = new FormData(form);

    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    status.textContent = '';
    status.classList.remove('is-error');

    fetch(form.action, {
      method: form.method,
      body: formData,
      headers: {
        Accept: 'application/json'
      }
    })
      .then(function (response) {
        if (response.ok) {
          form.reset();
          shell.hidden = true;
          success.hidden = false;
          return;
        }

        return response.json().then(function (data) {
          var message = 'Something went wrong. Please try again.';

          if (data && data.errors && data.errors.length > 0) {
            message = data.errors
              .map(function (error) {
                return error.message;
              })
              .join(' ');
          }

          throw new Error(message);
        });
      })
      .catch(function (error) {
        status.textContent = error.message;
        status.classList.add('is-error');
      })
      .finally(function () {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
      });
  });

  resetButton.addEventListener('click', function () {
    success.hidden = true;
    shell.hidden = false;
    status.textContent = '';
    status.classList.remove('is-error');
  });
});
