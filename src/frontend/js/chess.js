function JsonPost(endpoint, data) {
    return $.ajax({
        type: 'POST',
        url: `/api/${endpoint}`,
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: 'json'
    });
}
