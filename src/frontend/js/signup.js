async function on_submit(data) {
    let response;
    try {
        response = await JsonPost("signup", data);
    }
    catch (errorResponse) {
        console.log(errorResponse);
        ErrorToast("Error: A network request error occurred.")
        return;
    }

    console.log(response);

    if (response.status === "success") {
        window.location.assign("/thank-you");
    }
    else {
        ErrorToast(response.reason);
    }
}

function check_visible_fields() {
    if ($(".form .cohort select").val() == "contractor") {
        $(".form .company.block").css("display", "none");
        $(".form .cohort .label").text("3. Cohort");
    }
    else {
        $(".form .company.block").css("display", "block");
        $(".form .cohort .label").text("3a. Cohort");
    }
}

$(function () {
    // Check company display on load
    check_visible_fields();
    // Set company display depending on cohort selection
    $(".form .cohort select").on("change", check_visible_fields);

    $(".submit.button").on("click", async ev => {
        const name = $(".form .name input").val();
        const contact = $(".form .contact input").val();

        const roles = [];
        if ($(".form .role .player.checkbox").prop("checked")) {
            roles.push("player");
        }
        if ($(".form .role .official.checkbox").prop("checked")) {
            roles.push("official");
        }

        if (roles.length == 0) {
            ErrorToast("You must select at least one role.");
            return;
        }

        if (name.length == 0) {
            ErrorToast("You must enter a name.")
            return;
        }

        if (contact.length == 0) {
            ErrorToast("You must enter an email or phone number.");
            return;
        }

        const cohort = $(".form .cohort select").val();
        let company = undefined;
        if (cohort != "contractor") {
            company = $(".form .company select").val();
        }

        const submit_data = { name, roles, cohort, company, contact };
        if (window.location.origin.endsWith(".local")) {
            on_submit(submit_data);
        }
        else {
            grecaptcha.ready(function () {
                grecaptcha.execute(
                    '{RECAPTCHA_SITE_KEY}',
                    { action: 'submit' }
                ).then(token => {
                    submit_data.token = token;
                    on_submit(submit_data);
                });
            });
        }
    });
});
