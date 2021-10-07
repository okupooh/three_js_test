/*
 *
 */
function getDrillMeshCylinder(diameter,depth)
{
	//マテリアルはMeshPhongMaterial, color: 0x00FF7F
	// 上面半径2,下面半径20,高さ40,円周分割数50     
	const cylinder = new THREE.Mesh(                                     
		new THREE.CylinderGeometry(diameter/2,diameter/2,depth,12,false),                         
		new THREE.MeshNormalMaterial()
	//	new THREE.MeshPhongMaterial( {
	//		color: 0x00FF7F
	// 	} )
	);

	return cylinder;
}


/*
 *
 */
function getDrillMeshTube( start , end , diameter )
{
	/*
	const path = new THREE.SplineCurve3( [ start , end ] ) ;
	
	// pathに沿って32点で、太さ9・断面円の分割数8(つまり正8角形)の、開いた管を作る。デバッグ用オブジェクト作る。
	const tube = new THREE.Mesh(
		new THREE.TubeGeometry(path, 2, diameter, 8, false, true)　,
		new THREE.MeshNormalMaterial()
	);
	*/
	const path = new THREE.CatmullRomCurve3([ start , end ]);
 
   	// TubeGeometryでチューブを作成
	const geometry = new THREE.TubeGeometry( path, 128, diameter, 12, true );
	// カメラがチューブの内側にあるので、側面を逆にする必要がある
	const material = new THREE.MeshNormalMaterial({
	//	side : THREE.BackSide,
		side : THREE.DoubleSide,
	});
	var tube = new THREE.Mesh( geometry, material );
 
	return tube　;
}

/*
 *
 */
function getDrillMeshLathe( start , end , diameter ,tip)
{
	const vec3 = end.clone() ;
	vec3.sub( start )  ;
//	const dep = start.distanceTo( end ) + tip ;
	const dep = vec3.length() + tip ;

//console.log('dep: %d  tip: %d' , dep ,tip);

	const points = [
		new THREE.Vector3( 0 , dep /2 , 0 ),
		new THREE.Vector3( diameter/2 , (dep /2 ) - tip ,0 ) ,
		new THREE.Vector3( diameter/2 , - (dep /2 ) , 0) ,
		new THREE.Vector3( 0 , - (dep /2 ) , 0)
	];
	
	const geo = new THREE.LatheGeometry(points, 12) ;  // pointsで指定した図形を12段階で回転体化
	const mat = new THREE.MeshNormalMaterial({
		//	side : THREE.BackSide,
			side : THREE.DoubleSide,
		//	depthTest : false
		})
	
	const lathe = new THREE.Mesh( geo , mat ) ;
	/*
	const edges = new THREE.LineSegments(
			new THREE.EdgesGeometry( geo ) ,
			new THREE.LineBasicMaterial( { color: 0xFFFFFF } ) 
		) ;
	lathe.add (edges ) ;
	*/

	vec3.normalize()
	const axis = new THREE.Vector3(0, 1, 0);
	lathe.quaternion.setFromUnitVectors(axis, vec3);

	vec3.multiplyScalar( dep/2 );
	const pos = start.clone() ;
	pos.add( vec3 ) ;
	lathe.position.set( pos.x , pos.y , pos.z ) ;

	return lathe ;
}
