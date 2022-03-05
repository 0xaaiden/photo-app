const getCookie = key => {
    let name = key + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};

const story2Html = story => {
    return `
        <div>
            <img src="${ story.user.thumb_url }" class="pic" alt="profile pic for ${ story.user.username }" />
            <p>${ story.user.username }</p>
        </div>
    `;
};


const sugg2html = sgg => {
    return `

                <section>
                    <img src="${ sgg.thumb_url}" class="pic" alt="Profile pic for ${ sgg.username}" />
                    <div>
                        <p>${ sgg.username}</p>
                        <p>suggested for you</p>
                    </div>
                    <div><button 
                    class="link following active"
                    aria-label = "Follow"
                    aria-checked = "false" 
                    data-user-id="${sgg.id}" onclick = "toggleFollow(event)" >follow</button></div>
                </section>
    `;
}

const toggleFollow = ev => {
    const elem = ev.currentTarget;
    const userid = elem.dataset.userId;
    if (elem.innerHTML == "follow") {
        createNewFollower(userid, elem);
    } else {
        deleteFollower(elem.dataset.followingId, elem);
    }
    document.querySelector(".link")
}

const createNewFollower = (userId, elem) => {
    const postData = {
        "user_id": userId
    };
    
    fetch("/api/following/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            elem.innerHTML = "unfollow";
            // elem.classList.remove("following");
            elem.classList.add("unfollowing");
            elem.setAttribute("data-following-id", data.id);
            elem.setAttribute("aria-checked", "true");
            console.log(data);
        });
};

const deleteFollower = (followingID, elem) => {
    console.log(`${followingID}`)
    fetch(`/api/following/${followingID}`, {
        method: "DELETE",     
        headers: {
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        }
    })
    .then(response => response.json())
    .then(data => {
        elem.innerHTML = "follow";
        elem.classList.remove("unfollowing");
        elem.removeAttribute("data-following-id");
        elem.setAttribute("aria-checked", "false");
        console.log(data);
    });
};

const likeUnlike = (ev) => {
    const elem = ev.currentTarget;
    const postId = elem.dataset.postId;
    const likeId = elem.dataset.likeId;
    const statelike = elem.dataset.stateLikes;
    console.log("post id is ", postId, "likeId is ", likeId);
    if (statelike == "0") {
        fetch(`/api/posts/${postId}/likes/`, {
            method: "POST",
            headers: {
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            }
        })
        .then(response => response.json())
        .then(data => {
            // elem.innerHTML = `<i class="fas fa-heart"></i>`;
            // elem.setAttribute("data-state-likes", 1);
            // elem.setAttribute("data-like-id", data.id);
            
            fetch(`/api/posts/${postId}`, {
                method: "GET",
                headers: { 
                    'X-CSRF-TOKEN': getCookie('csrf_access_token')
                }
            })
            .then(response => response.json())
            .then(data => {
                const post = document.getElementById(postId);
                post.innerHTML = post2Html(data);
            });
        })
    } else if (statelike == "1") {
        fetch(`/api/posts/${postId}/likes/${likeId}`, {
            method: "DELETE",
            headers: {

                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            }
        })
        .then(response => response.json())
        .then(data => {
            // elem.innerHTML = `<i class="far fa-heart"></i>`;
            // elem.setAttribute("data-state-likes", 0);
            console.log(data)
            fetch(`/api/posts/${postId}`, {
                method: "GET",
                headers: {
       
                    'X-CSRF-TOKEN': getCookie('csrf_access_token')
                }
            })
            .then(response => response.json())
            .then(data => {
                const post = document.getElementById(postId);
                post.innerHTML = post2Html(data);
            });
        })
    }
}

const postComment = (ev) => {
    const elem = ev.currentTarget;
    
    const postId = elem.dataset.postId;
    const inputVal = document.getElementById("comment" + postId).value;
    console.log(inputVal);
    const comm_elem = elem.parentElement.parentElement.querySelector("#disp_comms");
    let comms;
    // 
    const postData = {
        "post_id": postId,
        "text": inputVal
    };
    fetch("/api/comments", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        },
        body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("comment" + postId).value = "";
        console.log(data);
        fetch(`/api/posts/${postId}`, {
            method: "GET",
            headers: {

                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            }
        })
        .then(response => response.json())
        .then(data => {
            comms = data.comments;
            console.log(comms);
            comm_elem.innerHTML = displayComments(comms, postId);

        });

    });
    
    // const likeId = elem.dataset.likeId;
    // const statelike = elem.dataset.stateLikes;
    // console.log("post id is ", postId, "likeId is ", likeId);
    // if (statelike == "0") {
    //     fetch(`/api/posts/${postId}/likes/`, {
    //         method: "POST"
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //         elem.innerHTML = `<i class="fas fa-heart"></i>`;
    //         elem.setAttribute("data-state-likes", 1);
    //         elem.setAttribute("data-like-id", data.id);
    //         console.log(data)
    //     })
    // } else if (statelike == "1") {
    //     fetch(`/api/posts/${postId}/likes/${likeId}`, {
    //         method: "DELETE"
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //         elem.innerHTML = `<i class="far fa-heart"></i>`;
    //         elem.setAttribute("data-state-likes", 0);
    //         console.log(data)
    //     })
    // }
}

const bookmark = (ev) => {
    const elem = ev.currentTarget;
    const bID = elem.dataset.bookmarkId;

    const postId = elem.dataset.postId;
    let post;
    // const likeId = elem.dataset.likeId;
    // const statelike = elem.dataset.stateLikes;
    console.log("bid id is ", bID, !bID, "post id is ", postId);
    const postData = {
        "post_id": postId
    };
    if (bID == -1) {
        fetch(`/api/bookmarks/`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            elem.innerHTML = `<i class="fas fa-bookmark"></i>`;

            // elem.setAttribute("data-state-likes", 1);
            elem.setAttribute("data-bookmark-id", data.id);
            elem.setAttribute("aria-checked", true);
            console.log(data)
        })
    } else if (bID > 0) {
        fetch(`/api/bookmarks/${bID}`, {
            method: "DELETE",
            headers: {
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            }
        })
        .then(response => response.json())
        .then(data => {
            elem.innerHTML = `<i class="far fa-bookmark"></i>`;
            elem.setAttribute("data-bookmark-id", -1);
            // elem.setAttribute("data-state-likes", 0);
            console.log(data)
            elem.setAttribute("aria-checked", false);
        })
    }
}

const post2Html = post => {
    let liked_post = post.current_user_like_id ? '1' : '0';
    let bookmark_id = post.current_user_bookmark_id ? post.current_user_bookmark_id : -1; 
    return `
    <div id="${post.id}">
    <section class="card">
    <div class="header">
        <h3>${ post.user.username }</h3>
        <i class="fa fa-dots"></i>
    </div>
    <img src="${ post.image_url }" alt="Image posted by ${ post.user.username }" width="300" height="300">
    <div class="info">
        <div class="buttons">
            <div>
                <button aria-label="Like post" aria-checked="${ post.current_user_like_id ? true : false }" class="no-button" data-post-id="${post.id}" data-like-id="${post.current_user_like_id}" data-state-likes=${liked_post} onclick="likeUnlike(event)">
                    <i class="fa${ post.current_user_like_id ? 's' : 'r' } fa-heart"></i>
                </button>
                <i class="far fa-comment"></i>
                <i class="far fa-paper-plane"></i>
            </div>
            <div>
            <button aria-label="Bookmark post" aria-checked="${ post.current_user_bookmark_id ? true : false }" class="no-button"  data-post-id="${post.id}" data-bookmark-id="${bookmark_id}" onclick="bookmark(event)">
                <i  class="fa${ post.current_user_bookmark_id ? 's' : 'r' } fa-bookmark"></i>
            </button>
                </div>
        </div>
        <p class="likes"><strong>${ post.likes.length } like${post.likes.length != 1 ? 's' : ''}</strong></p>
        <div class="caption">
        <p>
            <strong>${ post.user.username }</strong> 
            ${ post.caption }
        </p>
    </div>
    <div id="disp_comms">
    ${displayComments(post.comments, post.id)}
    </div>
    </div>
    <div class="add-comment">
            <div class="input-holder">
                <input id="${'comment' + post.id}" type="text" aria-label="Add a comment" placeholder="Add a comment...">
            </div>
            <button data-post-id="${post.id}"  class="link" onclick="postComment(event)">Post</button>
        </div>
</section></div>
    `;
};
const renderuserprofile = function()  {
    return `  

            <img src="${user_profile_url}" class="pic" alt="Profile pic for ${user_username}"/>
            <h2>${user_username}</h2>`;
};

const comm2html_modal = com => {
    let text = com.text;
    if  (text === undefined) {
        text = com.caption;
    }
    console.log(text)
    return `<div class="comm_modal">
            <img src="${com.user.thumb_url}" class="pic_modal">
            <span style="font-size: 14px;
            margin: 0px 5px 0 5px; justify-self:left;">
            <strong>${com.user.username}</strong> 
            ${text}
            </span>
            <a class="far fa-heart"></a>
        
</div>`;
}

const comm2html = com => {
    return `
    <div class="comments">
            <p>
                <strong>${com.user.username}</strong> 
                ${com.text}
            </p>
    </div>`;
}

const destroy = ev => {
    const postid = ev.currentTarget.dataset.postId;
    console.log("destroy");
    document.querySelector("#modal-container").innerHTML = "";
    document.querySelector("#bring_focus_" + postid).focus();
}
const showPostDetail = ev =>{
    const postid = ev.currentTarget.dataset.postId;
    
    fetch(`/api/posts/${postid}`, {
        method: 'GET',
        headers: {

            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        }
    })
    .then(response => response.json())
    .then(post => {
        const html = `        
            <div class="model-bg">
                <button aria-checked="false" aria-label="Close button for the modal" data-post-id="${postid}" id="focus_on_me" class="img_pos no-button" onclick="destroy(event)">
                <a class="fas fa-times"></a>
                </button>
                <div class="modal">
                   <img class="modal_img" src="${post.image_url}">
                    <div style="width: 30%; display:flex; flex-direction: column; overflow:auto;">
                        <header class="user_sugg_modal">  
                        <img src="${post.user.thumb_url}" class="pic_modal_user" alt="Profile pic for austin_sawyer">
                        <h2>${post.user.username}</h2>
                        </header><hr class="solid">
                        ${comm2html_modal(post)}
                    ${post.comments.map(comm2html_modal).join("\n")}
                    </div>
                </div>
            </div>`; 
            document.querySelector("#modal-container").innerHTML = html;
            document.querySelector("#focus_on_me").focus();
            document.onkeydown = function(evt) {
                evt = evt || window.event;
                if (evt.keyCode == 27) {
                    document.getElementById('focus_on_me').click();

                }
            };
        })
    
}


const displayComments = (comments, postID) =>
{
    if (comments.length>1) {
        return `<p><button id="${"bring_focus_" + postID}" data-post-id="${postID}" class="link" onclick="showPostDetail(event)">View all ${comments.length} comments</button></p>` + comm2html(comments[comments.length-1]);
    } else if (comments.length==1) {
        return comm2html(comments[0]);
    }
    return `${comments}`;
}

// fetch data from your API endpoint:
const displayStories = () => {
    fetch('/api/stories', {
        method: 'GET',
        headers: {
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        }
    })
        .then(response => response.json())
        .then(stories => {
            const html = stories.map(story2Html).join('\n');
            document.querySelector('.stories').innerHTML = html;
        })
};
// GEt post data from API endpoint

const displayPosts = () => {
    fetch('/api/posts', {
        method: 'GET',
        headers: {
            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        }
    })
        .then(response => response.json())
        .then(posts => {
            const html = posts.map(post2Html).join('\n');
            document.querySelector('#posts').innerHTML = html;
        })
};

const displaySugg = () => {
    fetch('/api/suggestions', {
            method: 'GET',
            headers: {
                'X-CSRF-TOKEN': getCookie('csrf_access_token')
            }
        })
        .then(response => response.json())
        .then(suggs => {
            const user_sugg = renderuserprofile();
            const html = suggs.map(sugg2html).join('\n');
            console.log(suggs);
            console.log('hi');
            document.querySelector('#user_sugg').innerHTML = user_sugg;
            document.querySelector('#suggestion-users').innerHTML = html;
            
        })
};
const initPage = () => {
    displayStories();
    displayPosts();
    displaySugg();
};


// invoke init page to display stories:
initPage();

