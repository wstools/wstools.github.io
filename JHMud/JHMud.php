<?php
header("Access-Control-Allow-Origin:http://jh.92mud.com");
$userlist = array(
    "炼丹师苏轻" => array(2019, 5, 21),
    "厨娘苏轻" => array(2019, 5, 31),
    "可口可乐" => array(2019, 12, 31)
);
$name = $_GET["name"];
$time = $userlist[$name];
$date = array((int)date("Y"), (int)date("m"), (int)date("d"));
$result = true;
$message = "<hic>你好，<hig>$name</hig>。欢迎使用 JHMud 插件！</hic>\n";

if ($time == null) {
    $result = false;
    $message .= "<hic>此插件为付费插件，请购买后使用！</hic>\n";
    $message .= "<hic>加入QQ群 <hig>580158261</hig> 有机会获得免费体验时长！</hic>\n";
} else {
    $message .= "<hic>你的使用截止时间为$time[0]年$time[1]月$time[2]日。</hic>\n";
    for ($i = 0; $i < 3; $i++) {
        if ($time[$i] < $date[$i]) {
            $message .= "<hir>已过期。</hir>\n";
            $result = false;
            break;
        } elseif ($time[$i] > $date[$i]) {
            break;
        }
    }
}
echo json_encode(array(
    "name" => $name,
    "date" => $date,
    "time" => $time,
    "result" => $result,
    "message" => $message
));
?>