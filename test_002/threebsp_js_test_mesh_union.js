/*
 *	threebsp_js_test_mesh_union.js
 */

/*
 *	箱 mesh を作成
 */
function getBoxMesh( wid , hei , dep )
{
	//箱を作成
	/**立方体はメッシュと言う表示オブジェクトを使って描画する。
	 *	メッシュを作るには、ジオメトリ（形状）とマテリアル（素材）の２種類を用意する必要がある 
	 */
	const gbox = new THREE.BoxGeometry( wid, hei, dep ) ;	//ner THREE.BoxGeometry(幅、高さ、奥行き)
	const mat = new THREE.MeshBasicMaterial( {wireframe: true} );
 	const mbox = new THREE.Mesh(gbox, mat);
//	mbox.position.set(0,0,0);

	return mbox ;
}


/*
 *	円+と円柱でドリル mesh を作成
 */
function getDrillMeshCylinder( start , end , diameter , tip )
{
	const vec3 = end.clone() ;
	vec3.sub( start )  ;
	const hei = vec3.length() ;
	const dep = hei + tip ;
	const rad = diameter / 2 ;

//	const mat = new THREE.MeshBasicMaterial({opacity: 0.5, wireframeLinewidth: 0.5});
	const mat = new THREE.MeshBasicMaterial( {wireframe: true} );

	const gcon = new THREE.CylinderGeometry( 0 , rad , tip , 24 , false ) ;
	// 円柱の座標は中心点が基準となるため2倍の長さを持つようにしている
	const gcyl = new THREE.CylinderGeometry( rad , rad , hei * 2 , 24 , false ) ;                      

	const mcon = new THREE.Mesh( gcon , mat ) ;
	mcon.position.y = + ( hei + (tip/2) ) ;
//	mcon.updateMatrix();
//	gcyl.merge( mcon.geometry, mcon.matrix ) ;

	const mcyl_w = new THREE.Mesh( gcyl , mat ) ;

	const bcon = new ThreeBSP( mcon );
	const bcyl_w = new ThreeBSP( mcyl_w );
	const bcyl = bcyl_w.union( bcon ) ;
	const mcyl = bcyl.toMesh() ;

	vec3.normalize()
	const axis = new THREE.Vector3(0, 1, 0);
//	mcyl.position.y = + dep ;
	mcyl.quaternion.setFromUnitVectors(axis, vec3);

	mcyl.position.set( start.x , start.y , start.z ) ;
/*
	vec3.multiplyScalar( dep / 2 );
	const pos = start.clone() ;
	pos.add( vec3 ) ;
	mcyl.position.set( pos.x , pos.y , pos.z ) ;
*/
	return mcyl ;
}


/*
 *	結合した mesh を作成
 */
function getUnionMesh( meshes )
{
	var unionBSP = null ;

	meshes.forEach( mesh => {
		if ( unionBSP == null ) {
			unionBSP = new ThreeBSP( mesh );
		} else {
			const meshBSP = new ThreeBSP( mesh );
			unionBSP = unionBSP.union( meshBSP ) ;
		}
	});

	const unionMesh = unionBSP.toMesh() ;

	return unionMesh ;
}


/*
 *	箱の内側で重なり合った部分の mesh を作成
 */
function getCrossMeshGroupInBox( meshes , boxMesh )
{
	const ret = new THREE.Group() ;

	const boxBSP = new ThreeBSP( boxMesh ) ;
	const mat = new THREE.MeshBasicMaterial( {
		 color: 0xFF0000 ,
		 opacity: 0.5 ,
		 transparent: true
	  } );

	for( let i=0; i<meshes.length; i++) {
		for( let j=0; j<meshes.length; j++) {
			if ( i == j ) continue ;

		//	const meshBSP1 = new ThreeBSP( meshes[i] ) ;
		//	const meshBSP2 = new ThreeBSP( meshes[j] ) ;
			const meshBSP1 = boxBSP.intersect( new ThreeBSP( meshes[i] ) ) ;
			const meshBSP2 = boxBSP.intersect( new ThreeBSP( meshes[j] ) ) ;
			const interBoxBSP = meshBSP1.intersect( meshBSP2 ) ;
		//	const interBoxBSP = boxBSP.intersect( interBSP ) ;
				
			if ( interBoxBSP.toGeometry().vertices.length > 0 ) {
				ret.add( interBoxBSP.toMesh( mat ) ) ; 				
			} 
		}
	}

	return ret ;
}

