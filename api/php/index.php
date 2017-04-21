<?php
/**
 * PHP Library for SMS API
 */
	
	class solusvm{
		function __construct() {
			$act = $_POST['action'];

			$this->url = $_POST['url'];
			$this->key = $_POST['key'];
			$this->hash = $_POST['hash'];

			if(method_exists($this, 'do'.$act)) {
				$act = 'do'.$act;
                $this->$act();
            }else{
                utils::error('参数错误');
            }
	    }

	    public function dostatus(){


            $info = $this->execute(array(
	    		'action'=>'info',
	    		'hdd'=>'true' , 
                'mem'=>'true',
                'bw'=>'true'
            ));

            $status = $this->execute(array(
	    		'action'=>'status'
            ));

            if($info === false || $status === false){
            	utils::error('获取失败');
            }else{
        		$ret = array();
            	$ret['label'] = $info['hostname'];
            	$ret['main_ip'] = $info['ipaddress'];
            	$ret['disk'] = explode(",",$info['hdd']);
            	$ret['bandwidth'] = explode(",",$info['bw']);
            	$ret['ram'] = explode(",",$info['mem']);
            	$ret['status'] = $status['statusmsg'];
        		utils::success(  json_encode($ret) , true  );
            }

	    }

	    public function docreate(){
	    	$params = array(
	    		'action'=>'info',
	    		'hdd'=>'true' , 
                'mem'=>'true',
                'bw'=>'true'
            );

            $result = $this->execute($params);
            
            if($result === false){
            	utils::error('获取失败');
            }else{
            	if($result['status'] && $result['status'] == 'error'){
            		utils::error(  $result['statusmsg']  );
            	}
            	else{
            		$ret = array();
	            	if($result['ipaddress']){
	            		$ret['location'] = utils::geo($result['ipaddress']);
	            	}
	            	$ret['label'] = $result['hostname'];
	            	$ret['main_ip'] = $result['ipaddress'];
	        		utils::success(  json_encode($ret) , true  );
            	}
            }        	
	    }

	    public function doboot(){

	    }

	    public function doshutdown(){

	    }

	    private function parser($data){
	    	preg_match_all('/<(.*?)>([^<]+)<\/\\1>/i', $data, $match);
			$result = array();
			foreach ($match[1] as $x => $y)
			{
			    $result[$y] = $match[2][$x];
			}

			return $result;
	    }

	    private function execute($params){
	    	$params['key'] = $this->key;
	    	$params['hash'] = $this->hash;

	    	$data = http_build_query($params);
	    	$url = $this->url;

			$opts = array(  
			   'http'=>array(  
			     'method'=>"POST", 
				 'header'=>"Content-type: application/x-www-form-urlencoded\r\n".  
			               "Content-length:".strlen($data)."\r\n" .   
			               "Cookie: foo=bar\r\n" .   
			               "\r\n",  
			     'content' => $data,  
			   )  
			);  
			$ctx = stream_context_create($opts);  
			$response = file_get_contents($url, false, $ctx);
			if($response === false){
	        	return false;
	        }else{
	        	$response = $this->parser($response);
	        }
	        return $response;
	    }
	}

	class vultr{
		function __construct() {
			$this->key = $_POST['key'];
			$this->url = 'https://api.vultr.com';

			$act = $_POST['action'];

			$act = 'do'.$act;

			if(method_exists($this, $act)) {
                $this->$act();
            }else{
                utils::error('参数错误');
            }

	    }

	    private function dolist(){
	    	$this->execute('/v1/server/list');
	    }

	    private function doexecute($url){
	    	$url = $this->url . $url;
	    	$opts = array(  
			   'http'=>array(  
			     'method'=>"GET",  
			     'header'=>"API-Key: ".$this->key."\r\n",  
			   )  
			);  
			$ctx = stream_context_create($opts);  
			$response = file_get_contents($url, false, $ctx);
			 if($response === false){
	        	utils::error('获取失败');
	        }else{
	        	utils::success( $response , true);
	        }
	    }
	}

	
	class utils {
		public static function geo($ip){
			//{"code":0,"data":{"country":"\u7f8e\u56fd","country_id":"US","area":"","area_id":"","region":"","region_id":"","city":"","city_id":"","county":"","county_id":"","isp":"","isp_id":"","ip":"107.175.156.217"}}
			$response = file_get_contents('http://ip.taobao.com/service/getIpInfo.php?ip='.$ip);
			if($response === false){
				return array('country'=>'','province'=>'');
			}else{
				$d = json_decode($response , true);
				return array('country'=>$d['data']['country'],'country_id'=>$d['data']['country_id'],'city'=>$d['data']['city']);
			}


			
		}
		public static function geo2($ip){
			$response = file_get_contents('http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=json&ip='.$ip);
			if($response === false){
				return array('country'=>'','province'=>'');
			}else{
				$d = json_decode($response , true);
				return array('country'=>$d['country'],'province'=>$d['province']);
			}

			http://ip.taobao.com/service/getIpInfo.php?ip=107.175.156.217
			
		}
        private static function process($v){
            $type = $_SERVER["HTTP_ACCEPT"];
            header('Access-Control-Allow-Origin: *');
			header('Access-Control-Allow-Methods: *');

            if(strpos($type , "/javascript")){
                header("Content-Type:text/javascript; charset=utf-8");
                if(!empty($_GET['callback'])){
                    $callback = $_GET['callback'];
                    $v = $callback."(".$v.")";
                }
            }else{
            	header("Content-Type:application/json; charset=utf-8");
            }
            echo($v);
            exit();
        }

        public static function errorPower()
        {
            $v = '{"status":-1,"info":"power request!"}';
            utils::process($v);
        }

        public static function info($code , $info ,$obj = false)
        {
            if($obj) $v = '{"status":"'.$code.'","detail":'.$info.'}';
            else $v = '{"status":"'.$code.'","detail":"'.$info.'"}';
            utils::process($v);
        }

        public static function success($info , $obj = false)
        {
            if($obj) $v = '{"status":0,"result":'.$info.'}';
            else $v = '{"status":0,"result":"'.$info.'"}';
            utils::process($v);
        }


        public static function error($info,$code='-1')
        {
            $v = '{"status":"'.$code.'","message":"'.$info.'"}';
            utils::process($v);
        }

        public static function conv($data){
    		preg_match_all('/<(.*?)>([^<]+)<\/\\1>/i', $data, $match);
			$result = array();
			foreach ($match[1] as $x => $y)
			{
			    $result[$y] = $match[2][$x];
			}

			return $result;
        }
        
    }


    class control
    {
        function __construct()
        {
            $this->request_init();
        }

        function request_init()
        {

            if (isset($_POST['type'])) {
                $mod = $_POST['type'];
                if (class_exists($mod)) {
                    try {
                        $instance = new $mod();
                    }
                    catch(Exception $error) {
                        utils::error('未知错误');
                    }
                } else {
                	utils::error('参数错误');
                }
            }else{
            	utils::error('参数错误');
            }
        }

        function authenticate($c,$m)
        {
            return (!empty($c->checkMethod))?in_array($m,$c->checkMethod):true;
        }
    }

    date_default_timezone_set('PRC');
    session_start();
	new control();
?>