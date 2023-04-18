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
editorIframe.style.width = "50%";
editorIframe.style.height = "100%";
editorIframe.style.maxWidth = "800px";
let editorIframeParent = editorIframe.parentNode;
//editorIframeParent.style.alignItems = 'center';
//editorIframeParent.style.justifyContent = 'center';
editorIframeParent.style.margin = "0px";
editorIframeParent.style.padding = "0px";
editorIframeParent.style.maxWidth = "100%";
let editorIframeParentParent = editorIframeParent.parentNode;

let editorDiv = document.createElement("div");
editorDiv.id = "mdeditor";
editorIframeParent.insertBefore(editorDiv, editorIframeParent[1]);
editorIframeParent.style.backgroundColor = "#ffffff";
//editorIframeParentParent.children[1].style.display = "none";
//editorIframeParentParent.children[2].style.display = "none";
//ditorIframeParentParent.children[1].style.display = "none";
//let updateBUtton = document.querySelector('[aria-label="Update"]');
//updateBUtton.setAttribute("aria-disabled", "false");
//updateBUtton.style.cursor = "pointer";


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

editor.setHTML(oldEditor.innerHTML);

const observer = new MutationObserver(debounce((mutationList, observer) =>
{
    if (editor.getHTML() !== oldEditor.innerHTML) 
    {
        editor.setHTML(oldEditor.innerHTML);
    }
}), 500);

observer.observe(editorIframeParentParent, { attributes: true });

editor.on("change", debounce(() =>
{
    oldEditor.innerHTML = editor.getHTML();
}, 16));

let mdCtrlKey = false;
let mcQKey = false;

document.addEventListener('keydown', (event) =>
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
        editor.setHTML(oldEditor.innerHTML);
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

iframeDoc.addEventListener('keydown', (event) =>
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
        editor.setHTML(oldEditor.innerHTML);
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