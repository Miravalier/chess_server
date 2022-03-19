$(function () {
    $(".submit.button").on("click", ev => {
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

        window.location.assign("/thank-you");
    });
});
