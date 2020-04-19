//hiển thị số lượt gửi lời mời kết bạn

function increaseNumberNotifContact(className){
    let currentValue = +$(`.${className}`).find("em").text(); // convert string to int '+'
    currentValue += 1;
    
    if (currentValue === 0 ){
        $(`.${className}`).html("");
    }else{
        $(`.${className}`).html(`(<em>${currentValue}</em>)`);
    }
}

function decreaseNumberNotifContact(className){
    let currentValue = +$(`.${className}`).find("em").text(); // convert string to int '+'
    currentValue -= 1;
    
    if (currentValue === 0 ){
        $(`.${className}`).html("");
    }else{
        $(`.${className}`).html(`(<em>${currentValue}</em>)`);
    }
}