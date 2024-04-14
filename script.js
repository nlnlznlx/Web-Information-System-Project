document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contact-form');

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Retrieve form data
        const formData = new FormData(form);

        // Construct email message
        const emailMessage = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        // You can implement email sending logic here, for demonstration purposes, let's just log the message
        console.log('Email Message:', emailMessage);

        // Clear form fields
        form.reset();
    });
});

