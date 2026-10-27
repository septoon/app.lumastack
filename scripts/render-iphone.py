"""Render the existing iPhone GLB once; no WebGL is needed by the website."""
from pathlib import Path
import math
import sys
import bpy
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

root = Path(__file__).resolve().parents[1]
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(root / 'public/models/iphone.glb'))
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
# GLTF Y-up becomes Blender Z-up. The front display faces +Y.
screen = bpy.data.objects['Screen']
# This exported mesh maps V in the opposite direction to the external screen.
for loop in screen.data.uv_layers.active.data:
    loop.uv.y = 1 - loop.uv.y
material = bpy.data.materials.new('App display')
material.use_nodes = True
nodes = material.node_tree.nodes
nodes.clear()
output = nodes.new('ShaderNodeOutputMaterial')
emission = nodes.new('ShaderNodeEmission')
texture = nodes.new('ShaderNodeTexImage')
texture.image = bpy.data.images.load(str(root / 'public/screens/home.png'))
material.node_tree.links.new(texture.outputs['Color'], emission.inputs['Color'])
material.node_tree.links.new(emission.outputs[0], output.inputs['Surface'])
screen.data.materials.clear()
screen.data.materials.append(material)
# Apply a small roll to the whole physical device, not to its screenshot.
rig = bpy.data.objects.new('Device pose', None)
bpy.context.collection.objects.link(rig)
for o in [o for o in bpy.context.scene.objects if o.parent is None and o != rig]:
    o.parent = rig
rig.rotation_euler.y = math.radians(-7)

def aim(obj, target=(0, 0, 0)):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()

def area(name, position, energy, size, color):
    data = bpy.data.lights.new(name, 'AREA')
    data.energy, data.shape, data.size, data.color = energy, 'DISK', size, color
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = position
    aim(obj)

area('Key softbox', (-0.18, 0.24, 0.2), 12, 0.22, (0.85, 0.91, 1))
area('Metal rim', (0.18, -0.04, 0.08), 9, 0.13, (0.65, 0.78, 1))
area('Front fill', (0.12, 0.3, -0.1), 5, 0.18, (1, 0.94, 0.87))
scene = bpy.context.scene
scene.world.color = (0.18, 0.18, 0.18)
camera_data = bpy.data.cameras.new('Product camera')
camera = bpy.data.objects.new('Product camera', camera_data)
bpy.context.collection.objects.link(camera)
camera.location = (0.09, 0.48, 0.05)
aim(camera)
camera_data.type = 'ORTHO'
camera_data.ortho_scale = 0.19
scene.camera = camera
scene.render.engine = 'CYCLES'
scene.cycles.samples = 32
scene.cycles.use_denoising = True
scene.render.resolution_x = 760
scene.render.resolution_y = 1300
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.view_settings.view_transform = 'Standard'
scene.render.image_settings.file_format = 'WEBP'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.quality = 94
scene.render.filepath = str(root / 'public/assets/device-iphone.webp')
if '--frame' in sys.argv:
    # Keep the model's rounded screen and camera cutout as an SVG mask. Fit its
    # UVs to the orthographic camera so any admin screenshot uses the same pose.
    import numpy as np
    bpy.context.view_layer.update()
    width, height = scene.render.resolution_x, scene.render.resolution_y
    rows, points, paths = [], [], []
    for polygon in screen.data.polygons:
        outline = []
        for index in polygon.loop_indices:
            loop = screen.data.loops[index]
            uv = screen.data.uv_layers.active.data[index].uv
            vertex = screen.data.vertices[loop.vertex_index]
            point = world_to_camera_view(scene, camera, screen.matrix_world @ vertex.co)
            x, y = point.x * width, (1 - point.y) * height
            rows.append([uv.x, 1 - uv.y, 1])
            points.append([x, y])
            outline.append(f'{x:.3f},{y:.3f}')
        paths.append('M' + 'L'.join(outline) + 'Z')
    coefficients = np.linalg.lstsq(np.array(rows), np.array(points), rcond=None)[0]
    error = np.max(np.abs(np.array(rows) @ coefficients - np.array(points)))
    if error > 0.5:
        raise RuntimeError(f'Screen projection error: {error:.3f}px')
    (a, d), (b, e), (c, f) = coefficients
    print(f'Screen CSS: left:{c / width * 100:.7f}%;top:{f / height * 100:.7f}%;'
          f'transform:matrix({a / width:.9f},{d / width:.9f},'
          f'{b / height:.9f},{e / height:.9f},0,0)')
    mask = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}">'
            '<path fill="white" d="' + ''.join(paths) + '"/></svg>')
    (root / 'public/assets/device-iphone-screen-mask.svg').write_text(mask)
    nodes.clear()
    output = nodes.new('ShaderNodeOutputMaterial')
    holdout = nodes.new('ShaderNodeHoldout')
    material.node_tree.links.new(holdout.outputs[0], output.inputs['Surface'])
    scene.render.filepath = str(root / 'public/assets/device-iphone-frame.webp')
bpy.ops.render.render(write_still=True)
