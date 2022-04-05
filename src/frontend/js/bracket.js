function GenerateSvgBody(content) {
    return `
        <svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#"
            xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg"
            xmlns="http://www.w3.org/2000/svg" id="bracket-svg" version="1.1" viewBox="0 0 300 160" height="600"
            width="1280" class="bracket-svg">
            ${content}
        </svg>
    `;
}

function GenerateSvgMatch(id, row, column, top_name, bottom_name, victory) {
    const x = 5 + column * 60;
    const y = 5 + row * 15;

    let top_color = "#ffffff";
    let bottom_color = "#ffffff";
    if (victory === true) {
        bottom_color = "#bbbbbb";
    }
    else if (victory === false) {
        top_color = "#bbbbbb";
    }

    return `
        <g transform="translate(${x},${y})" id="match${id}" class="match">
            <rect ry="1" style="fill:#535353;fill-opacity:1;stroke:#bc8700;stroke-width:0.25;stroke-opacity:1" y="0"
                x="4" height="10" width="50" id="container${id}" />
            <text id="text${id}_1" y="6.5" x="3"
                style="font-style:normal;font-weight:normal;font-size:5px;line-height:1;font-family:sans-serif;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:0.25">
                <tspan
                    style="font-size:5px;font-family:sans-serif;text-align:end;writing-mode:lr-tb;text-anchor:end;fill:#ffffff;stroke-width:0.25"
                    y="6.5" x="3" id="tspan${id}_1">${id}</tspan>
            </text>
            <text id="text${id}_2" y="4" x="4"
                style="font-style:normal;font-weight:normal;font-size:5px;line-height:1;font-family:sans-serif;fill:${top_color};fill-opacity:1;stroke:none;stroke-width:0.25">
                <tspan
                    style="font-size:5px;font-family:sans-serif;text-align:start;writing-mode:lr-tb;text-anchor:start;fill:${top_color};stroke-width:0.25"
                    y="4" x="4" id="tspan${id}_2">${top_name}</tspan>
            </text>
            <text id="text${id}_3" y="9" x="4"
                style="font-style:normal;font-weight:normal;font-size:5px;line-height:1;font-family:sans-serif;fill:${bottom_color};fill-opacity:1;stroke:none;stroke-width:0.25">
                <tspan
                    style="font-size:5px;font-family:sans-serif;text-align:start;writing-mode:lr-tb;text-anchor:start;fill:${bottom_color};stroke-width:0.25"
                    y="9" x="4" id="tspan${id}_3">${bottom_name}</tspan>
            </text>
            <path
                style="fill:none;stroke:#bc8700;stroke-width:0.26458332px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
                d="M 4,5 H 54" id="line${id}" />
        </g>
    `;
}

$(function () {
    $("#bracket").html(
        GenerateSvgBody(`
            ${GenerateSvgMatch(1, 0.5, 0, "SSG Sandoval", "1LT Ashley", true)}
            ${GenerateSvgMatch(2, 1.5, 0, "SPC Morschhauser", "SPC Bean", true)}
            ${GenerateSvgMatch(22, 3.5, 0, "Ken Burcaw", "WO1 Calhoun")}
            ${GenerateSvgMatch(23, 4.5, 0, "CPT Roberts", "SSG Johnson")}
            ${GenerateSvgMatch(20, 6.25, 0, "CPT Woodruff", "1LT Bos")}
            ${GenerateSvgMatch(21, 7, 0, "SSG Mills", "SPC Garza", false)}
            ${GenerateSvgMatch(3, 8, 0, "Ben Miramontes", "1LT Scott", true)}
            ${GenerateSvgMatch(4, 8.75, 0, "1LT Martinez", "SGT Addison", true)}

            ${GenerateSvgMatch(5, 1, 1, "SSG Sandoval", "SPC Morschhauser", true)}
            ${GenerateSvgMatch(6, 2, 1, "SGT Walsh", "LTC Nelson", false)}
            ${GenerateSvgMatch(7, 3, 1, "CPT Weiss", "CPT Legoas", false)}
            ${GenerateSvgMatch(8, 4, 1, "Match 22 Winner", "Match 23 Winner")}
            ${GenerateSvgMatch(9, 5, 1, "SFC Feese", "SPC DuFresne", true)}
            ${GenerateSvgMatch(10, 6, 1, "James Hogan", "CPT Fielder")}
            ${GenerateSvgMatch(11, 7, 1, "Match 20 Winner", "SPC Garza")}
            ${GenerateSvgMatch(12, 8, 1, "Ben Miramontes", "1LT Martinez")}

            ${GenerateSvgMatch(13, 1.5, 2, "SSG Sandoval", "LTC Nelson")}
            ${GenerateSvgMatch(14, 3.5, 2, "CPT Legoas", "")}
            ${GenerateSvgMatch(15, 5.5, 2, "SFC Feese", "")}
            ${GenerateSvgMatch(16, 7.5, 2, "", "")}

            ${GenerateSvgMatch(17, 2.5, 3, "", "")}
            ${GenerateSvgMatch(18, 6.5, 3, "", "")}

            ${GenerateSvgMatch(19, 4.5, 4, "", "")}
        `)
    );

    for (let i = 1; i <= 23; i++) {
        $(`#match${i}`).on("click", ev => {
            window.location.href = `/game?id=${i}`;
        });
    }
})
