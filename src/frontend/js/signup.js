async function on_submit(name, roles, rating, cohort, company, token) {
    let response;
    try {
        response = await JsonPost("signup", { name, roles, rating, cohort, company, token });
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

        if (name.length == 0) {
            ErrorToast("You must enter a name.")
            return;
        }

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

        const rating = $(".form .rating input").val() || undefined;
        const cohort = $(".form .cohort select").val();
        let company = undefined;
        if (cohort != "contractor") {
            company = $(".form .company select").val();
        }

        if (window.location.origin.endsWith(".local")) {
            on_submit(name, roles, rating, cohort, company, undefined);
        }
        else {
            grecaptcha.ready(function () {
                grecaptcha.execute(
                    '{RECAPTCHA_SITE_KEY}',
                    { action: 'submit' }
                ).then(token => {
                    on_submit(name, roles, rating, cohort, company, token);
                });
            });
        }
    });
});
