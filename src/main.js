async function setup()
{
    function debounce(func, delay)
    {
        let timeoutId;
        return function ()
        {
            const context = this;
            const args = arguments;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() =>
            {
                func.apply(context, args);
            }, delay);
        };
    }

    let editorIframe = document.getElementsByClassName("editable")[0];
    if (!editorIframe) return;

    editorIframe.style.width = "calc(50% - 50px)";
    editorIframe.style.height = "100%";
    editorIframe.style.maxWidth = "800px";
    let editorIframeParent = editorIframe.parentNode;
    editorIframeParent.style.margin = "0px";
    editorIframeParent.style.padding = "0px";
    editorIframeParent.style.maxWidth = "100%";
    let editorIframeParentParent = editorIframeParent.parentNode;

    let editorDiv = document.createElement("div");
    editorDiv.id = "mdeditor";
    editorIframeParent.insertBefore(editorDiv, editorIframeParent[1]);
    editorIframeParent.style.backgroundColor = "#ffffff";

    const Editor = toastui.Editor;
    const editor = new Editor({
        el: document.querySelector('#mdeditor'),
        height: '100%',
        initialEditType: 'wysiwyg',
        previewStyle: 'vertical',
        usageStatistics: false
    });

    const iframeDoc = editorIframe.contentWindow.document
    const oldEditor = iframeDoc.body;

    editor.setHTML(await reformatLinks(oldEditor.innerHTML));
    editor.moveCursorToStart();

    const editorObserver = new MutationObserver(debounce(async (mutationList, observer) =>
    {
        if (editor.getHTML() !== oldEditor.innerHTML) 
        {
            editor.setHTML(await reformatLinks(oldEditor.innerHTML));
        }
    }), 500);

    editorObserver.observe(editorIframeParentParent, { attributes: true });

    editor.on("change", debounce(() =>
    {
        oldEditor.innerHTML = editor.getHTML();
        const enterKeydownEvent = new KeyboardEvent("keydown", { key: "Enter" });
        const enterKeypressEvent = new KeyboardEvent("keypress", { key: "Enter" });
        const enterKeyupEvent = new KeyboardEvent("keyup", { key: "Enter" });
        oldEditor.dispatchEvent(enterKeydownEvent);
        oldEditor.dispatchEvent(enterKeypressEvent);
        oldEditor.dispatchEvent(enterKeyupEvent);
    }, 17));

    let mdCtrlKey = false;
    let mcQKey = false;

    document.addEventListener('keydown', async (event) =>
    {
        if (event.ctrlKey)
        {
            mdCtrlKey = true;
        }

        if (event.key === "q")
        {
            mcQKey = true;
        }

        if (mdCtrlKey && mcQKey)
        {
            editor.setHTML(await reformatLinks(oldEditor.innerHTML));
            event.preventDefault();
        }
    });

    document.addEventListener('keyup', (event) =>
    {
        if (event.ctrlKey)
        {
            mdCtrlKey = false;
        }

        if (event.key === "q")
        {
            mcQKey = false;
        }
    });

    iframeDoc.addEventListener('keydown', async (event) =>
    {
        if (event.ctrlKey)
        {
            mdCtrlKey = true;
        }

        if (event.key === "q")
        {
            mcQKey = true;
        }

        if (mdCtrlKey && mcQKey)
        {
            editor.setHTML(await reformatLinks(oldEditor.innerHTML));
            event.preventDefault();
        }
    });

    iframeDoc.addEventListener('keyup', (event) =>
    {
        if (event.ctrlKey)
        {
            mdCtrlKey = false;
        }

        if (event.key === "q")
        {
            mcQKey = false;
        }
    });


    async function reformatLinks(innerHTML)
    {
        const tempElement = document.createElement('div');
        tempElement.innerHTML = innerHTML;
        const links = tempElement.querySelectorAll('a');

        links.forEach(link =>
        {
            const originalAttrs = link.getAttribute('data-original-attrs');

            if (originalAttrs)
            {
                const originalAttrsObject = JSON.parse(originalAttrs);
                link.setAttribute('href', originalAttrsObject['data-original-href']);

                if (originalAttrsObject['target'])
                {
                    link.setAttribute('target', originalAttrsObject['target']);
                }

                link.removeAttribute('data-original-attrs');
            }
        });

        return tempElement.innerHTML;
    }





    let buttonsDiv = document.createElement('div');
    buttonsDiv.className = "buttons";

    function createNewButton()
    {
        const newButton = document.createElement('button');
        newButton.style.backgroundColor = "#00d1b1";
        newButton.style.color = "white";
        newButton.style.padding = "8px 12px";
        newButton.style.border = "none";
        newButton.style.borderRadius = "4px";
        newButton.style.margin = "8px";
        newButton.style.display = "flex";

        newButton.addEventListener("mouseenter", function ()
        {
            newButton.style.backgroundColor = "#009c87"; // Darken shade of #00d1b1
        });
        newButton.addEventListener("mouseleave", function ()
        {
            newButton.style.backgroundColor = "#00d1b1";
        });

        newButton.addEventListener("mousedown", function ()
        {
            newButton.style.backgroundColor = "#006e5c"; // Even darker shade of #00d1b1
        });
        newButton.addEventListener("mouseup", function ()
        {
            newButton.style.backgroundColor = "#00d1b1";
        });

        return newButton;
    }

    function createNewRedButton()
    {
        const newButton = document.createElement('button');
        newButton.style.backgroundColor = "#ff5a5f"; // Red color
        newButton.style.color = "white";
        newButton.style.padding = "8px 12px";
        newButton.style.border = "none";
        newButton.style.borderRadius = "4px";
        newButton.style.margin = "8px";
        newButton.style.display = "flex";

        newButton.addEventListener("mouseenter", function ()
        {
            newButton.style.backgroundColor = "#cc4c4f"; // Darken shade of red
        });
        newButton.addEventListener("mouseleave", function ()
        {
            newButton.style.backgroundColor = "#ff5a5f"; // Revert to red color
        });

        newButton.addEventListener("mousedown", function ()
        {
            newButton.style.backgroundColor = "#aa4246"; // Even darker shade of red
        });
        newButton.addEventListener("mouseup", function ()
        {
            newButton.style.backgroundColor = "#ff5a5f"; // Revert to red color
        });

        return newButton;
    }

    let saveButton = createNewButton();
    let saveAsButton = createNewButton();
    let loadButton = createNewButton();
    let donationButton = createNewButton();
    let githubButton = createNewButton();
    let reportButton = createNewRedButton();

    async function doLoadMarkdownButton()
    {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.md';

        fileInput.addEventListener('change', async function (event)
        {
            const file = event.target.files[0];
            const content = await readFile(file);
            editor.setMarkdown(content);
            editor.moveCursorToStart();
        });

        fileInput.click();
    }

    async function readFile(file)
    {
        return new Promise((resolve, reject) =>
        {
            const reader = new FileReader();
            reader.onload = function (event)
            {
                resolve(event.target.result);
            };
            reader.onerror = function (error)
            {
                reject(error);
            };
            reader.readAsText(file);
        });
    }

    async function doSaveMarkdownButton()
    {
        const blob = new Blob([editor.getMarkdown()], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const title = document.querySelector('[aria-label="Title"]');
        let filename = title.getAttribute('data-initial-value');

        if (title.length > 64) filename = filename.substring(0, 64);

        a.href = url;
        a.download = `${ filename }.md`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    async function doSaveAsMarkdownButton()
    {
        const title = document.querySelector('[aria-label="Title"]');
        let filename = title.getAttribute('data-initial-value');

        if (title.length > 64) filename = filename.substring(0, 64);

        const fileHandle = await window.showSaveFilePicker({
            suggestedName: `${ filename }.md`,
            types: [{
                description: 'Markdown Files',
                accept: {
                    'text/markdown': ['.md']
                }
            }]
        });

        if (fileHandle)
        {
            const writableStream = await fileHandle.createWritable();
            await writableStream.write(editor.getMarkdown());
            await writableStream.close();
        }
    }

    async function doReportButton()
    {
        const url = 'https://github.com/opdev1004/mdblogger/issues';
        window.open(url, '_blank');
    }

    async function doDonationButton()
    {
        const url = 'https://ko-fi.com/opdev1004';
        window.open(url, '_blank');
    }

    async function doGithubButton()
    {
        const url = 'https://github.com/opdev1004/mdblogger';
        window.open(url, '_blank');
    }

    saveButton.onclick = doSaveMarkdownButton;
    saveAsButton.onclick = doSaveAsMarkdownButton;
    loadButton.onclick = doLoadMarkdownButton;
    donationButton.onclick = doDonationButton;
    githubButton.onclick = doGithubButton;
    reportButton.onclick = doReportButton;
    saveButton.innerText = "Save";
    saveAsButton.innerText = "Save As";
    loadButton.innerText = "Load";
    donationButton.innerText = "Tip Snacks";
    githubButton.innerText = "Github";
    reportButton.innerText = "Report";
    buttonsDiv.appendChild(saveButton);
    buttonsDiv.appendChild(saveAsButton);
    buttonsDiv.appendChild(loadButton);
    buttonsDiv.appendChild(donationButton);
    buttonsDiv.appendChild(githubButton);
    buttonsDiv.appendChild(reportButton);
    let tooltip = document.createElement("div");
    tooltip.innerHTML = `
        MD Blogger Tooltip: <br /><br />
        Pressing 'Ctrl' and 'q' will copy what is in the blogger editor (Left) and paste to the markdown editor (Right).
        <br /><br />
        If this extension is not working, just try to refresh(F5) the edit page.
        <br /><br />
        Don't forget to support this extension! Thank you!
        `
    tooltip.style.width = "150px";
    tooltip.style.backgroundColor = "#cccccc";
    tooltip.style.margin = "8px";
    tooltip.style.padding = "8px 12px";
    tooltip.style.borderRadius = "4px";
    buttonsDiv.appendChild(tooltip);
    editorIframeParent.insertBefore(buttonsDiv, editorIframeParent[1]);

}

setInterval(() =>
{
    let mdblogger = document.getElementById("mdeditor");

    if (!mdblogger)
    {
        let bloggereditorIframe = document.getElementsByClassName("editable")[0];

        if (bloggereditorIframe)
        {
            setup();
        }
    }
}, 500);