const container1 = document.getElementById('container1');
// const container2 = document.getElementById('container2');

// function whichContainer() {
//     chrome.storage.local.get('whichContainer', function(result) {
//         console.log('Value currently is ' + result.whichContainer);
//         if (result.whichContainer === undefined || result.whichContainer === null || result.whichContainer === "") {
//             result.whichContainer = 'container1';
//             chrome.storage.local.setItem('whichContainer', 'result.whichContainer');
//         }
//         return result.whichContainer;
//     });


//     // chrome.storage.local.get(['whichContainer']);
//     // if (container === undefined || container === null || container === "") {
//     //     container = 'container1';
//     //     chrome.storage.local.setItem('whichContainer', container);
//     // }

//     // console.log("Current container: " + container);

//     // return container;
// }

// function setContainer( container ) {
//     console.log("Setting container", container);
//     chrome.storage.local.setItem('whichContainer', container);
// }

// function saveContainer( container, data ) {
//     console.log("Saving container", container);
//     chrome.storage.local.setItem(container, data);
// }

// function readContainer( container ) {
//     console.log("Reading container", container);
//     let data = chrome.storage.local.get([container]);
//     if (data === undefined || data === null) {
//         return "";
//     }

//     return data;
// }

// function extractCookies() {
//     console.log("Extracting cookies");
//     let cookies = document.cookie;
//     document.cookie = "";
//     return cookies;
// }

// function setCookies( cookies ) {
//     console.log("Setting cookies");
//     document.cookie = cookies;
//     window.location.reload();
// }

// function switchContainer( element ) {
//     let to = element;
//     let currentContainer = whichContainer();
//     if (currentContainer === to) {
//         return;
//     }

//     console.log("Switching from", currentContainer, "to", to);
    
//     let currentCookies = extractCookies();
//     saveContainer( currentContainer, currentCookies );
//     let newCookies = readContainer( to );
//     setContainer( to );
//     setCookies( newCookies );
// }

function nofaillog( message ) {
    try {
        console.log(message);
    } catch {}
}

function updateTabDisplay(content) {
    document.getElementById('currentTabDisplay').innerHTML = content;
}


function switchContainer( newContainer ) {
    chrome.storage.local.get('whichContainer', function( result ) {
        console.log('Current Container is ' + result.whichContainer);
        if (result.whichContainer === undefined || result.whichContainer === null || result.whichContainer === "") {
            result.whichContainer = newContainer;
            chrome.storage.local.set({ 'whichContainer': newContainer });
            updateTabDisplay('Current Container: ' + newContainer);
            return;
        }

        if (result.whichContainer !== newContainer) {
            console.log("Switching to new container");
            let currentContainer = result.whichContainer;

            // Find the current tab
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                nofaillog(tabs);
                let currentTab = tabs[0];

                // Get cookies
                chrome.cookies.getAll({ url: currentTab.url }, function(cookies) {
                    nofaillog("Cookies for current tab: ");
                    nofaillog(cookies);

                    let saveCookies = {
                        url: currentTab.url,
                        cookies: cookies
                    };

                    // Save cookies to local storage for container
                    chrome.storage.local.set({ [ currentContainer ]: saveCookies }, function() {
                        nofaillog("Cookies saved to local storage");
                        nofaillog("Deleting cookies from current tab");

                        // Clear cookies
                        cookies.forEach(function(cookie) {
                            chrome.cookies.remove({ url: currentTab.url, name: cookie.name }, function() {
                                nofaillog("Cookie removed");
                            });
                        });

                        // Get cookies from new container
                        chrome.storage.local.get(newContainer, function(result) {
                            nofaillog("Cookies from new container: ");
                            nofaillog(result[newContainer]);

                            // Set cookies
                            if (result[newContainer] !== undefined && result[newContainer] !== null && result[newContainer].cookies !== undefined && result[newContainer].cookies !== null) {
                                result[newContainer].cookies.forEach(function(cookie) {
                                    chrome.cookies.set({ url: currentTab.url, name: cookie.name, value: cookie.value, domain: cookie.domain, path: cookie.path, secure: cookie.secure, httpOnly: cookie.httpOnly, expirationDate: cookie.expirationDate }, function() {
                                        nofaillog("Cookie set");
                                    });
                                });
                            }

                            // Set new container
                            chrome.storage.local.set({ 'whichContainer': newContainer }, function() {
                                nofaillog("New container set");
                            });

                            updateTabDisplay('Current Container: ' + newContainer);

                            // Open cached tab page
                            chrome.tabs.update(currentTab.id, { url: result[newContainer].url });
                        });
                    })
                });
            });

            // nofaillog(currentTab);

            // // Get cookies
            // chrome.cookies.getAll({}, function(cookies) {
            //     nofaillog(cookies);
            // });
            

            // Save cookies to current container

            // Clear cookies

            // Get cookies from new container

            // Set cookies

            // Set new container
        }
    });
}


if (container1) {
    container1.onclick = function() {
        switchContainer('container1');
    }
}

if (container2) {
    container2.onclick = function() {
        switchContainer('container2');
    }
}

// if (container2) {
//     container2.onClick = function() {
//         console.log("Container 2 clicked");
//         switchContainer('container2');
//     }
// }