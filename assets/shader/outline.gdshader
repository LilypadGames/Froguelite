shader_type canvas_item;

uniform vec4 line_color : source_color;
uniform float line_thickness : hint_range(0, 10) = 1;

uniform sampler2D screen_texture : hint_screen_texture;

void fragment() {
// Get the size of the pixels on screen, and create a variable for out outline
vec2 size = SCREEN_PIXEL_SIZE * line_thickness;

float outline = texture(screen_texture, SCREEN_UV + vec2(-size.x, 0)).a;
outline += texture(screen_texture, SCREEN_UV + vec2(0, size.y)).a;
outline += texture(screen_texture, SCREEN_UV + vec2(size.x, 0)).a;
outline += texture(screen_texture, SCREEN_UV + vec2(0, -size.y)).a;
outline = min(outline, 1.0);

// Get the texture from the screen
vec4 tex = texture(screen_texture, SCREEN_UV);
vec4 modulate = COLOR - vec4(1, 1, 1, 1);
tex = mix(tex, line_color + modulate, outline - ceil(tex.a));

COLOR = tex;
}