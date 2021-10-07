/* 面番号と位置：
 *    2
 *  5 0 4 1 
 *    3
 */
var positionSurfaceView = [
	{ top: 1 , left: 1 },
	{ top: 1 , left: 3 },
	{ top: 0 , left: 1 },
	{ top: 2 , left: 1 },
	{ top: 1 , left: 2 },
	{ top: 1 , left: 0 },
];

var positionSurfaceCamera = [
	{ x: 0 , y: 0 , z: 1 },
	{ x: 0 , y: 0 , z: -1 },
	{ x: 0 , y: -1 , z: 0 },
	{ x: 0 , y: 1 , z: 0 },
	{ x: 1 , y: 0 , z: 0 },
	{ x: -1 , y: 0 , z: 0 },
];


function getSurfaceWidthHeight(  width , height , depth )
{
	const surfaceWH = [] ;

	surfaceWH.push( { width: width , height: height } ) ;
	surfaceWH.push( { width: width , height: height } ) ;
	surfaceWH.push( { width: width , height: depth } ) ;
	surfaceWH.push( { width: width , height: depth } ) ;
	surfaceWH.push( { width: depth , height: height } ) ;
	surfaceWH.push( { width: depth , height: height } ) ;

	return surfaceWH ;
}


function getSurfacePosition( w , h , d )
{
	const surfacePos = [
		{ left: d     , top: d   , width: w , height: h } ,
		{ left: w+d*2 , top: d   , width: w , height: h } ,
		{ left: d     , top: 0   , width: w , height: d } ,
		{ left: d     , top: h+d , width: w , height: d } ,
		{ left: w+d   , top: d   , width: d , height: h } ,
		{ left: 0     , top: d   , width: d , height: h }
	] ;

	return surfacePos ;
}


function getSurfaceCameras( width , height , depth )
{
	const cameras = [] ;

//	const surWH = getSurfaceWidthHeight(width , height , depth ) ;
	const surPos = getSurfacePosition(width , height , depth ) ;
	const far = 2000;
	const ratio = 2;

	for(let i=0 ; i<6 ; i++){
	//	const aspect = surPos[i].width / surPos[i].height;
		const aspect = 1 ;
	const subcamera = new THREE.OrthographicCamera(
			- ((surPos[i].width * aspect) / 2) , ((surPos[i].width * aspect) / 2) ,
			(surPos[i].height / 2) , - (surPos[i].height / 2 ) , 0.1, far) ;		//(画角, アスペクト比)
	//	const subcamera = new THREE.OrthographicCamera(
	//		surWH[i].width * aspect / - ratio, surWH[i].width * aspect / ratio,
	//		surWH[i].height / ratio, surWH[i].height / - ratio, 1, far) ;		//(画角, アスペクト比)
		subcamera.position.set(	positionSurfaceCamera[i].x * width ,
								positionSurfaceCamera[i].y * height ,
								positionSurfaceCamera[i].z * depth ) ;	//カメラのセット位置（x, y, z）
	//	subcamera.lookAt(scene.position);
		subcamera.lookAt(new THREE.Vector3(0, 0, 0));
		cameras.push(subcamera);
	}

	return cameras ;
}


function getSurfaceViewports( width , height , depth )
{
	const viewports = [] ;

//	const surWH = getSurfaceWidthHeight(width , height , depth) ;
	const surPos = getSurfacePosition( width , height , depth ) ;

	for(let i=0 ; i<6 ; i++){
		const area = {
			left: Math.floor( surPos[i].left ) ,
			top: Math.floor( surPos[i].top ) ,
			width: Math.ceil( surPos[i].width ) ,
			height: Math.ceil( surPos[i].height ) } ;

//		renderer.setViewport( Math.floor(0 * width), Math.floor(0 * height),
//							  Math.ceil(width), Math.ceil(height) );
		/*
		area.left = Math.floor(surPos[i].left) ;
		area.top =  Math.floor(surPos[i].top) ;
		area.width = Math.ceil( surPos[i].width ) ;
		area.height = Math.ceil( surPos[i].height ) ;
		*/

		viewports.push(area);
	}

	return viewports ;
}

/*
 *
 *
 */
var _drills = [] ;

function init( width , height , depth )
{
/*	//サイズを指定
	const width = 500;
	const height = 400;
	const depth = 300;
*/
	//シーンを作成(シーンとは３D空間のこと,3Dオブジェクトそのものや光源の置き場)
	const scene = new THREE.Scene({antialias: true});
//	scene.background = new THREE.Color( 0xF0F0F0 );

	//箱を作成
	/**立方体はメッシュと言う表示オブジェクトを使って描画する。
	 *	メッシュを作るには、ジオメトリ（形状）とマテリアル（素材）の２種類を用意する必要がある 
	 */
	const geometry = new THREE.BoxGeometry(width, height, depth);//ner THREE.BoxGeometry(幅、高さ、奥行き)
	const material = new THREE.MeshNormalMaterial();//適当なカラーを割り当てるマテリアル

	material.opacity = 0.25 ;
	material.transparent = true ;
//	material.wireframe  = true ;
//	material.wireframeLinewidth = 3 ;

	const box = new THREE.Mesh(geometry, material);
	box.position.set(0,0,0);

	//シーンに追加
	scene.add(box);

	/*
	const cylinder = getDrillMeshCylinder( 100 , 200 ) ;
	cylinder.position.set(100,100,0);
	scene.add(cylinder);

	//
	const tube = getDrillMeshTube(
					new THREE.Vector3(200,200,300) ,
					new THREE.Vector3(200,200,-300) , 20 ) ;

	scene.add(tube);
	*/

	_drills.forEach( drl => {
		const lathe = getDrillMeshLathe(
			new THREE.Vector3( drl.x1 , drl.y1 , drl.z1 ) ,
			new THREE.Vector3( drl.x2 , drl.y2 , drl.z2 ) , drl.diameter , drl.tip ) ;
	
		scene.add(lathe);
			
	});

	//	ライトの作成
	// new THREE.AmbientLight(色, 光の強さ)
//	const light = new THREE.AmbientLight(0xFFFFFF, 1.0);
	const light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
	scene.add(light);

	//	カメラの作成
	const cameras = getSurfaceCameras( width , height , depth ) ;
	const viewports = getSurfaceViewports( width , height , depth ) ;

	const viewport3D = {
		left: width*2 + depth*2 ,
		top: 0 ,
		width: height + depth*2 ,
		height: height + depth*2 } ;

	const camera3D = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
//	const camera3D = new THREE.OrthographicCamera(
//		( viewport3D.width  / 2) , ( viewport3D.width / -2 ) ,
//		( viewport3D.height / 2) , ( viewport3D.height / -2 ) , 1, 2000) ;		//(画角, アスペクト比)

	camera3D.position.set( width *2,  height *2, depth *2) ;	//カメラのセット位置（x, y, z）
	camera3D.lookAt(scene.position);

	//	レンダリング処理
	const renderer = new THREE.WebGLRenderer({
		canvas:document.querySelector('#myCanvas')
	});
	
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize((width*2 + depth*2)+viewport3D.width, height + depth*2);
	renderer.autoClear = false ;

	//	クリッピング平面
	renderer.clippingPlanes.push(new THREE.Plane(new THREE.Vector3(-1, 0, 0), Math.ceil(width / 2)+1 ) ) ;
	renderer.clippingPlanes.push(new THREE.Plane(new THREE.Vector3(1, 0, 0), Math.ceil(width / 2)+1 ) ) ;
	renderer.clippingPlanes.push(new THREE.Plane(new THREE.Vector3(0, -1, 0), Math.ceil(height / 2)+1 ) ) ;
	renderer.clippingPlanes.push(new THREE.Plane(new THREE.Vector3(0, 1, 0), Math.ceil(height / 2)+1 ) ) ;
	renderer.clippingPlanes.push(new THREE.Plane(new THREE.Vector3(0, 0, -1), Math.ceil(depth / 2)+1 ) ) ;
	renderer.clippingPlanes.push(new THREE.Plane(new THREE.Vector3(0, 0, 1), Math.ceil(depth / 2)+1 ) ) ;

	//	初回実行
	tick();

	function tick(){
		for(let i=0 ; i<6 ; i++){
		//	cameras[i].lookAt(scene.position);
			renderer.setViewport( viewports[i].left , viewports[i].top ,
								  viewports[i].width , viewports[i].height );
			renderer.render(scene, cameras[i]);//レンダリング（更新処理）
		}

		renderer.setViewport( viewport3D.left , viewport3D.top ,
							  viewport3D.width , viewport3D.height );
		renderer.render(scene, camera3D) ;
		
		requestAnimationFrame(tick);

		//アニメーション処理をここに書く
		// box.rotation.y += 0.01;
		//renderer.render(scene, camera);//レンダリング（更新処理）
	}

}
