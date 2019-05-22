<?php

header("Access-Control-Allow-Origin:http://jh.92mud.com"); //制定允许其他域名访问
header("Access-Control-Allow-Methods:POST,GET,OPTIONS,PUT,DELETE"); //响应类型
header("Access-Control-Allow-Headers:x-requested-with,content-type"); //响应头设置

$name = $_POST["name"];

if ($name == "可口可乐") {
    echo json_encode(array("name" => $name, "time" => "20190606"));
}

$list = array(
    "可口可乐" => array(2019, 6, 6),
);

if ($list[$name]) {
    $time = $list[$name];
    if ($time[0] < date("Y")) {
        echo json_encode(array("result" => "0"));
    } elseif ($time[0] > date("Y")) {
        echo json_encode(array("result" => "1"));
    } elseif ($time[0] == date("Y")) {

        if ($time[1] < date("M")) {
            echo json_encode(array("result" => "0"));
        } elseif ($time[1] > date("M")) {
            echo json_encode(array("result" => "1"));
        } elseif ($time[1] == date("M")) {

        }
    }
}
?>