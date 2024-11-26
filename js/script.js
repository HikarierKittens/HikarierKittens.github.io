document.addEventListener("click", function (event)
{

    const emojiElement = document.createElement("div"); // 创建一个div元素
    emojiElement.classList.add("emoji");  // 设置样式
    emojiElement.innerText = getRandomEmoji(); // 设置内容
    emojiElement.style.color = getRandomColor(); // 设置颜色
    emojiElement.style.left = `${event.clientX - 25}px`; // 设置位置
    emojiElement.style.top = `${event.clientY - 10}px`;

    document.body.appendChild(emojiElement); // 将元素添加到页面
    emojiElement.addEventListener('animationend', () =>
    {
        emojiElement.remove(); // 动画结束后移除元素
    });
});

function getRandomColor() // 获取随机颜色css
{
    return `rgb(${getRandomInt(0, 230)}, ${getRandomInt(0, 230)}, ${getRandomInt(0, 230)})`;
}

function getRandomInt(min, max)  // 生成随机数
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomEmoji()  // 获取随机表情
{
    const emojis = [
        "(｡♥‿♥｡)", "(＾▽＾)", "(✿◠‿◠)", "(╯°□°）╯︵ ┻━┻", "(¬‿¬)", "灬º‿º灬♡", "≧◡≦", "´｡• ᵕ •｡`", "っ◕‿◕っ", "≧▽≦", "♡°▽°♡", "＾▽＾", "ฅ^•ﻌ•^ฅ", "=①ω①=", "(・`ω´・)", "ฅ'ω'ฅ", "♡ >ω< ♡", "*ΦωΦ*", "(≚ᄌ≚)ƶƵ", "ฅ•̀ω•́ฅ", "｡>﹏<｡", "つω`｡", "✿◠‿◠", "٩(◕‿◕｡)۶", "´∩｡• ᵕ •｡∩`"
    ];
    return emojis[getRandomInt(0, emojis.length - 1)];
}

