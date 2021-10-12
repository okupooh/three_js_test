/*
 * 展開図の面番号と位置：
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

/*
 * 面番号のカメラのベクトル
 */
var positionSurfaceCamera = [
	{ x: 0 , y: 0 , z: 1 },
	{ x: 0 , y: 0 , z: -1 },
	{ x: 0 , y: 1 , z: 0 },
	{ x: 0 , y: -1 , z: 0 },
	{ x: 1 , y: 0 , z: 0 },
	{ x: -1 , y: 0 , z: 0 },
];

/*
 * 面番号の幅と高さ
 */
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

/*
 * 面番号の描画座標と幅、高さ
 */
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

/*
 * 展開図のカメラを作成
 */
function getSurfaceCameras( width , height , depth )
{
	const cameras = [] ;

	const surPos = getSurfacePosition(width , height , depth ) ;
	const far = 2000;
	const ratio = 2;

	for(let i=0 ; i<6 ; i++){
	//	const aspect = surPos[i].width / surPos[i].height;
		const aspect = 1 ;
	const subcamera = new THREE.OrthographicCamera(
			- ((surPos[i].width * aspect) / 2) , ((surPos[i].width * aspect) / 2) ,
			(surPos[i].height / 2) , - (surPos[i].height / 2 ) , 0.1, far) ;		//(画角, アスペクト比)
		subcamera.position.set(	positionSurfaceCamera[i].x * width ,
								positionSurfaceCamera[i].y * height ,
								positionSurfaceCamera[i].z * depth ) ;	//カメラのセット位置（x, y, z）
	//	subcamera.lookAt(scene.position);
		subcamera.lookAt(new THREE.Vector3(0, 0, 0));
		cameras.push(subcamera);
	}

	return cameras ;
}

/*
 * 展開図の Viewport を作成
 */
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
			height: Math.ceil( surPos[i].height )
		} ;

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
	//	シーンを作成(シーンとは３D空間のこと,3Dオブジェクトそのものや光源の置き場)
	const scene = new THREE.Scene({antialias: true});
//	scene.background = new THREE.Color( 0xF0F0F0 );

	//	箱 mesh を作成
	const boxMesh = getBoxMesh(width, height, depth);
	boxMesh.position.set(0,0,0);

	//	ドリル mesh 配列を作成
	var drillMeshes = [] ;

	_drills.forEach( drl => {
		const drillMesh =	getDrillMeshCylinder(
								new THREE.Vector3( drl.x1 , drl.y1 , drl.z1 ) ,
								new THREE.Vector3( drl.x2 , drl.y2 , drl.z2 ) ,
								drl.diameter , drl.tip ) ;
		drillMeshes.push( drillMesh ) ;
	});

	//	箱の内側でドリルが重なり合った部分の mesh グループを作成
	const crossMeshGrp = getCrossMeshGroupInBox( drillMeshes , boxMesh ) ;
//console.log( crossMeshGrp.length ) ;

	//	結合ドリル mesh を作成
	const drillMesh = getUnionMesh( drillMeshes ) ;

	//	結合ドリル mesh で穴をあけた箱 mesh を作成
	const drillBSP = new ThreeBSP( drillMesh ) ;
	const boxBSP = new ThreeBSP( boxMesh ) ;
	const subBoxBSP = boxBSP.subtract( drillBSP ) ;
	const subBoxMesh = subBoxBSP.toMesh();

	//	描画用に箱の内側の結合ドリル mesh を作成
	const interDrillBSP = boxBSP.intersect( drillBSP );
	const interDrillMesh = interDrillBSP.toMesh();

	//	箱 mesh の調整
	subBoxMesh.updateMatrix();
	subBoxMesh.material.shading = THREE.FlatShading;
	subBoxMesh.material.opacity = 0.5 ;
	subBoxMesh.material.transparent = true ;
//	subBoxMesh.material.side = THREE.DoubleSide ;
	subBoxMesh.geometry.computeFaceNormals();
	subBoxMesh.geometry.computeVertexNormals();
	subBoxMesh.material.needsUpdate = true;
	subBoxMesh.geometry.buffersNeedUpdate = true;
	subBoxMesh.geometry.uvsNeedUpdate = true;

	//	箱とドリルの線を作成	
	const interDrillEdge = new THREE.LineSegments(
		new THREE.EdgesGeometry( interDrillMesh.geometry , 1 ) ,
		new THREE.LineBasicMaterial( { color: 0xFFFFFF , linewidth: 3.0 } ) 
	) ;
	interDrillMesh.add ( interDrillEdge ) ;

	const boxEdge = new THREE.LineSegments(
		new THREE.EdgesGeometry( boxMesh.geometry , 1 ) ,
		new THREE.LineBasicMaterial( { color: 0xFFFFFF , linewidth: 3.0 } ) 
	) ;
	subBoxMesh.add( boxEdge ) ;

	//	シーンに追加
	scene.add( subBoxMesh );
//	scene.add(unionMesh);
	scene.add( interDrillEdge );
	scene.add( crossMeshGrp );

	//	ライトの作成
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
	renderer.localClippingEnabled = true;

	//	クリッピング平面
/*	renderer.clippingPlanes.push(new THREE.Plane(new THREE.Vector3(-1, 0, 0), Math.ceil(width / 2)+1 ) ) ;
	renderer.clippingPlanes.push(new THREE.Plane(new THREE.Vector3(1, 0, 0), Math.ceil(width / 2)+1 ) ) ;
	renderer.clippingPlanes.push(new THREE.Plane(new THREE.Vector3(0, -1, 0), Math.ceil(height / 2)+1 ) ) ;
	renderer.clippingPlanes.push(new THREE.Plane(new THREE.Vector3(0, 1, 0), Math.ceil(height / 2)+1 ) ) ;
	renderer.clippingPlanes.push(new THREE.Plane(new THREE.Vector3(0, 0, -1), Math.ceil(depth / 2)+1 ) ) ;
	renderer.clippingPlanes.push(new THREE.Plane(new THREE.Vector3(0, 0, 1), Math.ceil(depth / 2)+1 ) ) ;
*/
	const controls = new THREE.OrbitControls(camera3D , document.querySelector('#myCanvas') );

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
		
		controls.update();
		requestAnimationFrame(tick);

		//アニメーション処理をここに書く
		// box.rotation.y += 0.01;
		//renderer.render(scene, camera);//レンダリング（更新処理）
	}

}
