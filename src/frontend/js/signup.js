$(function () {
    $(".submit.button").on("click", async ev => {
        const name = $(".form .name input").val();

        if (name.length == 0) {
            Error("You must enter a name.")
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
            Error("You must select at least one role.");
            return;
        }

        const rating = $(".form .rating input").val() || undefined;

        let response;
        try {
            response = await JsonPost("signup", { name, roles, rating });
        }
        catch (errorResponse) {
            console.log(errorResponse);
            Error("Error: A network request error occurred.")
            return;
        }

        if (response.status === "success") {
            window.location.assign("/thank-you");
        }
        else {
            Error(response.reason);
        }
    });
});
